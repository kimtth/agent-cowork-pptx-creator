/**
 * IPC Handler: Chat — Copilot SDK integration
 * Ported from ref/copilot-sdk-pptx-agent/src/infrastructure/copilot/client.ts
 * and ref/copilot-sdk-pptx-agent/src/app/api/chat/route.ts
 *
 * SSE is replaced with win.webContents.send() IPC events.
 */

import { ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { onSettingsSaved } from './settings-handler.ts';
import { CopilotClient, defineTool, approveAll } from '@github/copilot-sdk';
import type { SessionConfig } from '@github/copilot-sdk';
import { getCopilotClient, getSessionOptions, resetCopilotClient, resolveWorkflowInstructionPath } from './copilot-runtime.ts';
import type { ThemeTokens } from '../../src/domain/entities/palette';
import type {
  SlideItem,
  DesignBrief,
  FrameworkType,
  ScenarioPayload,
  SlideUpdatePayload,
} from '../../src/domain/entities/slide-work';
import type { DataFile, ScrapeResult } from '../../src/domain/ports/ipc';
import { getAvailableIconChoices } from '../../src/domain/icons/iconify';
import type { IconifyCollectionId } from '../../src/domain/icons/iconify';
import { formatWorkflowForPrompt, getWorkflowConfig, type WorkflowConfig } from '../../src/domain/workflows/workflow-config';

const CHAT_REQUEST_TIMEOUT_MS = 10 * 60 * 1000;

type ActiveChatRequest = {
  cancel: (reason?: string) => void;
};

let activeChatRequest: ActiveChatRequest | null = null;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface WorkspaceContext {
  title: string;
  slides: SlideItem[];
  designBrief: DesignBrief | null;
  designStyle: import('../../src/domain/entities/slide-work').DesignStyle | null;
  framework: FrameworkType | null;
  pptxBuildError: string | null;
  theme: ThemeTokens | null;
  workflow: WorkflowConfig | null;
  dataSources: DataFile[];
  urlSources: Array<{ url: string; status: string; result?: ScrapeResult }>;
  iconProvider: 'iconify';
  iconCollection: IconifyCollectionId;
  availableIcons: string[];
}

type SessionMode = 'story' | 'pptx';

type SkillDirectoryEntry = {
  name: string;
  path: string;
};

async function listSkillDirectories(): Promise<SkillDirectoryEntry[]> {
  const skillsRoot = path.join(app.getAppPath(), 'skills');
  try {
    const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        name: entry.name,
        path: path.join(skillsRoot, entry.name),
      }));
  } catch {
    return [];
  }
}

function rankSkillDirectory(mode: SessionMode, skillName: string): number {
  const normalized = skillName.toLowerCase();

  if (mode === 'pptx') {
    if (/review|qa|validation|final/.test(normalized)) return 0;
    if (/design|style|designer/.test(normalized)) return 1;
    if (/manipulation|python-pptx|generate-pptx/.test(normalized)) return 2;
    if (/summarize/.test(normalized)) return 3;
    if (/story|framework/.test(normalized)) return 4;
    return 10;
  }

  if (/slide-story|story|framework/.test(normalized)) return 0;
  if (/summarize/.test(normalized)) return 1;
  if (/design|style|designer/.test(normalized)) return 2;
  if (/review|qa|validation|final/.test(normalized)) return 3;
  if (/manipulation|python-pptx|generate-pptx/.test(normalized)) return 4;
  return 10;
}

async function getSkillDirectories(mode: SessionMode): Promise<string[]> {
  const entries = await listSkillDirectories();
  if (entries.length === 0) return [];

  const ranked = entries
    .map((entry) => ({
      ...entry,
      rank: rankSkillDirectory(mode, entry.name),
    }))
    .filter((entry) => entry.rank < 10)
    .sort((left, right) => left.rank - right.rank || left.name.localeCompare(right.name));

  return ranked.map((entry) => entry.path);
}

function resolveWorkflow(message: string, workspace: WorkspaceContext): WorkflowConfig | null {
  if (workspace.workflow) return workspace.workflow
  if (isPptxGenerationRequest(message, workspace)) return getWorkflowConfig('create-pptx')
  return null
}

function resolveSessionMode(message: string, workspace: WorkspaceContext): SessionMode {
  const workflow = resolveWorkflow(message, workspace)
  if (workflow) return workflow.mode as SessionMode
  return isPptxGenerationRequest(message, workspace) ? 'pptx' : 'story'
}

function isPptxGenerationRequest(message: string, workspace: WorkspaceContext): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return false;
  if (workspace.slides.length === 0) return false;
  return /\b(create|generate|build|export)\b.*\b(pptx|powerpoint|deck)\b|\bpython-pptx\b/.test(normalized);
}

function truncateText(value: string, maxLen: number): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLen) return compact;
  return `${compact.slice(0, maxLen)}...`;
}

function truncateMarkdown(value: string, maxLen: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}\n\n[Truncated]`;
}

async function readArtifactMarkdown(artifact: { markdownPath: string } | undefined, maxLen: number): Promise<string | null> {
  if (!artifact?.markdownPath) return null;
  try {
    const markdown = await fs.readFile(artifact.markdownPath, 'utf-8');
    const trimmed = markdown.trim();
    return trimmed ? truncateMarkdown(trimmed, maxLen) : null;
  } catch {
    return null;
  }
}

async function readWorkflowMarkdown(workflow: WorkflowConfig | null, maxLen: number): Promise<string | null> {
  if (!workflow?.instructionFile) return null;
  try {
    const markdown = await fs.readFile(resolveWorkflowInstructionPath(workflow.instructionFile), 'utf-8');
    const trimmed = markdown.trim();
    return trimmed ? truncateMarkdown(trimmed, maxLen) : null;
  } catch {
    return null;
  }
}

async function formatFileSource(ds: DataFile): Promise<string[]> {
  const parts = [`- **${ds.name}** (${ds.type.toUpperCase()}): ${ds.summary}`];
  if (ds.consumed) {
    parts.push(`  Parsed source file: ${ds.consumed.markdownPath}`);
    const markdown = await readArtifactMarkdown(ds.consumed, 20_000);
    if (markdown) {
      parts.push('  Parsed content:');
      parts.push('```md');
      parts.push(markdown);
      parts.push('```');
    } else {
      parts.push(`  Summary file: ${ds.consumed.summaryPath}`);
      parts.push(ds.consumed.summaryText);
    }
    return parts;
  }
  if (ds.headers && ds.headers.length > 0) {
    parts.push(`  Columns: ${ds.headers.join(', ')}`);
  }
  if (Array.isArray(ds.rows) && ds.rows.length > 0) {
    parts.push(`  Sample rows: ${JSON.stringify(ds.rows.slice(0, 3))}`);
  }
  if (typeof ds.text === 'string' && ds.text.trim()) {
    parts.push(`  Excerpt: ${truncateText(ds.text, 1000)}`);
  }
  return parts;
}

async function formatUrlSource(entry: WorkspaceContext['urlSources'][number]): Promise<string[]> {
  const parts = [`- **${entry.url}** (${entry.status})`];
  if (entry.result?.error) {
    parts.push(`  Error: ${entry.result.error}`);
    return parts;
  }
  if (entry.result?.consumed) {
    parts.push(`  Parsed source file: ${entry.result.consumed.markdownPath}`);
    const markdown = await readArtifactMarkdown(entry.result.consumed, 20_000);
    if (markdown) {
      parts.push('  Parsed content:');
      parts.push('```md');
      parts.push(markdown);
      parts.push('```');
    } else {
      parts.push(`  Summary file: ${entry.result.consumed.summaryPath}`);
      parts.push(entry.result.consumed.summaryText);
    }
    return parts;
  }
  if (entry.result?.title) {
    parts.push(`  Title: ${entry.result.title}`);
  }
  if (entry.result?.text) {
    parts.push(`  Excerpt: ${truncateText(entry.result.text, 1000)}`);
  }
  if (entry.result?.lists?.length) {
    parts.push(`  Key list items: ${entry.result.lists.slice(0, 8).join(' | ')}`);
  }
  return parts;
}

async function buildPrompt(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  workspace: WorkspaceContext,
): Promise<string> {
  const parts: string[] = [];

  // Chat history
  if (history.length > 0) {
    parts.push('## Conversation History\n');
    for (const msg of history.slice(-10)) {
      parts.push(`**${msg.role === 'user' ? 'User' : 'Assistant'}**: ${msg.content}`);
    }
    parts.push('');
  }

  // Workspace state
  if (workspace.title || workspace.slides.length > 0) {
    parts.push('## Current Workspace\n');
    if (workspace.title) parts.push(`Presentation: "${workspace.title}"`);
    if (workspace.framework) parts.push(`Framework: ${workspace.framework}`);
    if (workspace.designStyle) parts.push(`Design style: ${workspace.designStyle}`);
    if (workspace.slides.length > 0) {
      parts.push(`Slides: ${workspace.slides.length}`);
      for (const s of workspace.slides) {
        const imgParts: string[] = [];
        if (s.imagePath) imgParts.push(`imagePath: ${s.imagePath}`);
        if (s.selectedImages.length > 0) {
          imgParts.push(`selectedImages: ${s.selectedImages.map((img) => img.imagePath ?? img.imageUrl ?? img.id).join(', ')}`);
        }
        parts.push(`  ${s.number}. [${s.layout}] ${s.title}`);
        parts.push(`     keyMessage: ${s.keyMessage}`);
        if (s.bullets.length > 0) parts.push(`     bullets: ${s.bullets.join(' | ')}`);
        if (s.icon) parts.push(`     icon: ${s.icon}`);
        if (imgParts.length > 0) parts.push(`     ${imgParts.join('; ')}`);
      }
    }
    if (workspace.theme) {
      parts.push(`Theme: "${workspace.theme.name}" — Primary: #${workspace.theme.C.PRIMARY}, Accent: #${workspace.theme.C.ACCENT1}`);
    }
    parts.push('');
  }

  if (workspace.pptxBuildError) {
    parts.push('## Last PPTX Build Failure\n');
    parts.push('The previous generated python-pptx code failed to run. Fix the issue and regenerate the full Python file.');
    parts.push(workspace.pptxBuildError);
    parts.push('');
  }

  // Data sources
  if (workspace.dataSources.length > 0) {
    parts.push('## Available File Data Sources\n');
    for (const ds of workspace.dataSources) {
      parts.push(...await formatFileSource(ds));
    }
    parts.push('');
  }

  if (workspace.urlSources.length > 0) {
    parts.push('## Available URL Sources\n');
    for (const entry of workspace.urlSources) {
      parts.push(...await formatUrlSource(entry));
    }
    parts.push('');
  }

  if (workspace.theme) {
    parts.push('## Active Theme Palette\n');
    parts.push(`Theme name: ${workspace.theme.name}`);
    const slots = workspace.theme.slots;
    parts.push(`OOXML slots: dk1=#${slots.dk1}, lt1=#${slots.lt1}, dk2=#${slots.dk2}, lt2=#${slots.lt2}, accent1=#${slots.accent1}, accent2=#${slots.accent2}, accent3=#${slots.accent3}, accent4=#${slots.accent4}, accent5=#${slots.accent5}, accent6=#${slots.accent6}, hlink=#${slots.hlink}, folHlink=#${slots.folHlink}`);
    parts.push(`Semantic colors: PRIMARY=#${workspace.theme.C.PRIMARY}, SECONDARY=#${workspace.theme.C.SECONDARY}, BG=#${workspace.theme.C.BG}, TEXT=#${workspace.theme.C.TEXT}, ACCENT3=#${workspace.theme.C.ACCENT3}, ACCENT4=#${workspace.theme.C.ACCENT4}, ACCENT5=#${workspace.theme.C.ACCENT5}, ACCENT6=#${workspace.theme.C.ACCENT6}`);
    if (workspace.theme.colors.length > 0) {
      parts.push(`Palette colors: ${workspace.theme.colors.slice(0, 20).map((color) => `${color.name} ${color.hex}`).join(' | ')}`);
    }
    parts.push('Use the OOXML slot hex values as color constants in python-pptx code when generating slides.');
    parts.push('');
  }

  if (workspace.workflow) {
    parts.push('## Active Workflow\n');
    parts.push(formatWorkflowForPrompt(workspace.workflow));
    const workflowMarkdown = await readWorkflowMarkdown(workspace.workflow, 12_000);
    if (workflowMarkdown) {
      parts.push('Workflow instruction file:');
      parts.push('```md');
      parts.push(workflowMarkdown);
      parts.push('```');
    }
    parts.push('');
  }

  if (workspace.slides.length > 0) {
    parts.push('## PPTX Preflight Review\n');
    parts.push('Before starting any python-pptx code creation, use the slide-final-review skill as the mandatory preflight QA step if it is available.');
    parts.push('Resolve contrast, overlap, clipping, spacing, hierarchy, and color-consistency issues in the composition before writing the final PPTX code.');
    parts.push('Do not treat this as a post-processing note. Treat it as a required review pass before code generation begins.');
    parts.push('');
  }

  if (workspace.designStyle) {
    parts.push('## Selected PPTX Design Style\n');
    parts.push(`Apply the "${workspace.designStyle}" style consistently across the deck.`);
    parts.push('If the pptx-design-styles skill is available, use it together with the python-pptx generation/manipulation skill.');
    parts.push('Use slide-final-review before starting python-pptx code creation so design issues are corrected in the composition itself, not deferred until the end.');
    parts.push('');
  }

  if (workspace.availableIcons.length > 0) {
    parts.push('## Available Icons\n');
    parts.push(`Icon provider: ${workspace.iconProvider}`);
    parts.push(`Preferred icon set: ${workspace.iconCollection}`);
    if (workspace.availableIcons.length > 0) {
      parts.push(`Icon names: ${workspace.availableIcons.join(', ')}`);
    }
    parts.push('Use Iconify icon IDs such as "mdi:cloud-outline" or the legacy aliases above when they strengthen the communication.');
    parts.push('');
  }

  parts.push(`## User Message\n${message}`);
  return parts.join('\n');
}

function sendToWindow(win: BrowserWindow, channel: string, ...args: unknown[]): void {
  if (win.isDestroyed() || win.webContents.isDestroyed()) return;
  win.webContents.send(channel, ...args);
}

// ---------------------------------------------------------------------------
// IPC handler registration
// ---------------------------------------------------------------------------

export function registerChatHandlers(getWindow: () => BrowserWindow | null): void {
  // Reset the Copilot client singleton whenever the user saves new settings
  // so the next chat:send picks up the updated token / endpoint.
  onSettingsSaved(() => { resetCopilotClient(); });

  ipcMain.on('chat:cancel', () => {
    activeChatRequest?.cancel('Generation cancelled.');
  });

  ipcMain.on('chat:send', (_event, payload: {
    message: string;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    workspace: WorkspaceContext;
  }) => {
    void (async () => {
      const win = getWindow();
      if (!win) return;

      if (activeChatRequest) {
        sendToWindow(win, 'chat:error', 'Another generation is already in progress. Cancel it before starting a new one.');
        return;
      }

      const { message, history, workspace } = payload;

      // Validate
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        sendToWindow(win, 'chat:error', 'Message must not be empty');
        return;
      }

      const prompt = await buildPrompt(message, history, workspace);

      let session: Awaited<ReturnType<CopilotClient['createSession']>> | null = null;
      let requestSettled = false;
      let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

      const clearRequestTimeout = () => {
        if (!timeoutHandle) return;
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      };

      const completeRequest = () => {
        if (requestSettled) return;
        requestSettled = true;
        sendToWindow(win, 'chat:done');
      };

      const failRequest = (messageText: string) => {
        if (requestSettled) return;
        requestSettled = true;
        sendToWindow(win, 'chat:error', messageText);
      };

      activeChatRequest = {
        cancel: (reason = 'Generation cancelled.') => {
          if (requestSettled) return;
          clearRequestTimeout();
          activeChatRequest = null;
          failRequest(reason);
          if (session) {
            void session.disconnect().catch(() => {});
          }
        },
      };

      // Tool factories (close over win for IPC emission)
      const scenarioTool = defineTool('set_scenario', {
      description:
        'Set the slide scenario (outline) for the presentation workspace panel. ' +
        'Each slide must have a keyMessage (the "so what" / key takeaway), a layout hint, and optionally an icon hint. ' +
        'You may also include imageQuery when supporting images should later be searched for and selected on the slide. ' +
        'Available layouts: title, agenda, section, bullets, cards, stats, comparison, timeline, diagram, summary. ' +
        'The layout and icon are guidance for the later PPTX design step, not a rigid rendering contract. ' +
        'When helpful, include a designBrief describing tone, audience, visual style, density, and layout approach. ' +
        `Use Iconify icon IDs for icons. Supported examples and aliases: ${getAvailableIconChoices(workspace.iconCollection).join(', ')}.`,
      parameters: {
        type: 'object' as const,
        properties: {
          title: { type: 'string', description: 'Presentation title' },
          slides: {
            type: 'array',
            description: 'Array of slide definitions',
            items: {
              type: 'object',
              properties: {
                number: { type: 'number' },
                title: { type: 'string' },
                keyMessage: { type: 'string' },
                layout: { type: 'string' },
                bullets: { type: 'array', items: { type: 'string' } },
                notes: { type: 'string' },
                icon: { type: 'string' },
                imageQuery: { type: 'string' },
              },
              required: ['number', 'title', 'keyMessage', 'layout', 'bullets', 'notes'],
            },
          },
          designBrief: {
            type: 'object',
            properties: {
              objective: { type: 'string' },
              audience: { type: 'string' },
              tone: { type: 'string' },
              visualStyle: { type: 'string' },
              colorMood: { type: 'string' },
              density: { type: 'string' },
              layoutApproach: { type: 'string' },
              directions: { type: 'array', items: { type: 'string' } },
            },
            required: ['objective', 'audience', 'tone', 'visualStyle', 'colorMood', 'density', 'layoutApproach', 'directions'],
          },
          framework: { type: 'string' },
        },
        required: ['title', 'slides'],
      },
      handler: async (args: ScenarioPayload) => {
        win.webContents.send('chat:scenario', args);
        return { success: true, message: `Scenario "${args.title}" set with ${args.slides.length} slides.` };
      },
    });

      const updateSlideTool = defineTool('update_slide', {
      description: 'Update a single slide in the existing scenario. Use when the user asks to change a specific slide. You may also update imageQuery to change the image search keywords used for that slide.',
      parameters: {
        type: 'object' as const,
        properties: {
          number: { type: 'number' },
          title: { type: 'string' },
          keyMessage: { type: 'string' },
          layout: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' },
          icon: { type: 'string' },
          imageQuery: { type: 'string' },
        },
        required: ['number', 'title', 'keyMessage', 'layout', 'bullets', 'notes'],
      },
      handler: async (args: SlideUpdatePayload) => {
        win.webContents.send('chat:slide-update', args);
        return { success: true, message: `Slide ${args.number} updated.` };
      },
    });

      const suggestFrameworkTool = defineTool('suggest_framework', {
      description:
        'Suggest a presentation framework based on the content and audience. ' +
        'Call this BEFORE creating the slide scenario to help the user understand the recommended structure. ' +
        'Available frameworks: mckinsey (executive recommendation deck), scqa (situation-complication-question-answer), ' +
        'pyramid (top-down argument), mece (problem decomposition), action-title (conclusion-first slides), ' +
        'assertion-evidence (claim + supporting data), exec-summary-first (decision-maker deck).',
      parameters: {
        type: 'object' as const,
        properties: {
          primary: { type: 'string', description: 'Recommended framework name' },
          reasoning: { type: 'string', description: 'Why this framework fits the user\'s request' },
        },
        required: ['primary', 'reasoning'],
      },
      handler: async (args: { primary: string; reasoning: string }) => {
        win.webContents.send('chat:framework-suggested', args);
        return { success: true, message: `Framework "${args.primary}" suggested.` };
      },
    });

      const buildSessionConfig = (opts: Partial<SessionConfig>, skillDirectories: string[], mode: SessionMode, workflow: WorkflowConfig | null): SessionConfig => ({
        ...opts,
        tools: mode === 'pptx'
          ? []
          : [scenarioTool, updateSlideTool, suggestFrameworkTool],
        skillDirectories,
        systemMessage: {
          mode: 'append' as const,
          content: mode === 'pptx'
            ? `${workflow?.agentDirective ?? ''} You are a PPTX code generation specialist. Always respond in the same language as the user. Use the current workspace slides, theme, data sources, and grounded image paths as the source of truth. Before starting any python-pptx code creation, apply the slide-final-review skill as a mandatory preflight QA pass if it is available, and resolve contrast, overlap, clipping, spacing, hierarchy, image-legibility, and color-consistency issues in the final composition first. Then use the PPTX generation/manipulation skills to implement the corrected composition. For image consistency, treat slide.imagePath as the primary approved preview image and use that same image in the exported PPTX whenever it is present. If slide.selectedImages contains additional images, treat them as alternates unless the user explicitly requests a multi-image composition. Focus only on producing a valid Python code block that uses python-pptx. Do not suggest frameworks. Do not call set_scenario. Do not call update_slide. Do not narrate status. Output only the final python code block. Use the runtime variables OUTPUT_PATH, PPTX_TITLE, and PPTX_THEME. Prefer defining build_presentation(output_path, theme, title), and save the deck to output_path.`.trim()
            : `${workflow?.agentDirective ?? ''} You are an expert presentation designer and business consultant that helps create professional PowerPoint decks. Always respond in the same language as the user. Use the provided file contents, scraped URL contents, active theme palette, available icons, and any selectedImages already attached to slides as grounding context for slide creation and PPTX generation. When creating a presentation outline, FIRST use suggest_framework to recommend and justify a framework, THEN use set_scenario to send the full scenario to the workspace panel. Do not generate python-pptx code during prestaging or brainstorming workflows. Use the slide panel as the destination for preliminary content creation so the user can refine slides and attach images before PPTX generation. When generating PPTX later, treat slide layout and icon values as hints rather than rigid instructions, and choose a stronger visual composition when it communicates the approved story better. For image consistency, treat slide.imagePath as the primary approved preview image and use that same image in the exported PPTX whenever it is present. If slide.selectedImages contains additional images, treat them as alternates unless the user explicitly requests a multi-image composition. When updating a single slide, use update_slide. Never output slide listings in the chat message itself. Keep chat messages short — action summaries only. Use strong action-title headlines for every slide.`.trim(),
        },
        onPermissionRequest: approveAll,
      });

      const wireSession = (s: typeof session) => {
        s!.on('assistant.reasoning_delta', (event) => {
          const delta = event.data?.deltaContent ?? '';
          if (delta) sendToWindow(win, 'chat:stream', { thinking: delta });
        });
        s!.on('assistant.message_delta', (event) => {
          const delta = event.data?.deltaContent ?? '';
          if (delta) sendToWindow(win, 'chat:stream', { content: delta });
        });
        s!.on('session.error', (event) => {
          const msg = event.data?.message ?? 'Unknown error';
          failRequest(msg);
        });
      };

      try {
        const copilot = await getCopilotClient();
        const sessionOpts = await getSessionOptions({ streaming: true });
        const workflow = resolveWorkflow(message, workspace);
        const sessionMode: SessionMode = resolveSessionMode(message, workspace);
        const skillDirectories = await getSkillDirectories(sessionMode);

        session = await copilot.createSession(buildSessionConfig(sessionOpts, skillDirectories, sessionMode, workflow));
        wireSession(session);

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(() => {
            if (session) {
              void session.disconnect().catch(() => {});
            }
            reject(new Error(`Generation timed out after ${Math.round(CHAT_REQUEST_TIMEOUT_MS / 60000)} minutes. Try a simpler prompt or run the request again.`));
          }, CHAT_REQUEST_TIMEOUT_MS);
        });

        await Promise.race([
          session.sendAndWait({ prompt }, 600_000),
          timeoutPromise,
        ]);

        completeRequest();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        failRequest(msg);
      } finally {
        clearRequestTimeout();
        activeChatRequest = null;
        if (session) await session.disconnect().catch(() => {});
      }
    })().catch((err) => {
      const win = getWindow();
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (win) {
        sendToWindow(win, 'chat:error', msg);
      }
      activeChatRequest = null;
      console.error('[chat:send] Unhandled error', err);
    });
  });
}
