/**
 * IPC Handler: Chat — Copilot SDK integration
 * Ported from ref/copilot-sdk-pptx-agent/src/infrastructure/copilot/client.ts
 * and ref/copilot-sdk-pptx-agent/src/app/api/chat/route.ts
 *
 * SSE is replaced with win.webContents.send() IPC events.
 */

import { ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';
import path from 'path';
import { app } from 'electron';
import { onSettingsSaved } from './settings-handler.ts';
import { CopilotClient, defineTool, approveAll } from '@github/copilot-sdk';
import type { SessionConfig } from '@github/copilot-sdk';
import { normalizeGitHubToken, resolveCopilotCliPath } from './copilot-client-utils.ts';
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

// ---------------------------------------------------------------------------
// Copilot client singleton
// ---------------------------------------------------------------------------

let clientInstance: CopilotClient | null = null;
const AZURE_OPENAI_SCOPE = 'https://cognitiveservices.azure.com/.default';

async function getCopilotClient(): Promise<CopilotClient> {
  if (!clientInstance) {
    const token = normalizeGitHubToken(process.env.GITHUB_TOKEN);
    const cliPath = resolveCopilotCliPath();
    clientInstance = new CopilotClient({
      cliPath,
      ...(token ? { githubToken: token } : {}),
      ...(token ? { useLoggedInUser: false } : {}),
    });
  }
  return clientInstance;
}

async function getSessionOptions(opts?: {
  streaming?: boolean;
  model?: string;
}): Promise<Partial<SessionConfig>> {
  const provider = process.env.MODEL_PROVIDER?.trim().toLowerCase();
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
  const modelName = opts?.model ?? process.env.MODEL_NAME;
  const streaming = opts?.streaming ?? false;
  const useAzureOpenAI = Boolean(endpoint);

  if (!provider && !modelName && !useAzureOpenAI) return { streaming };
  if (!useAzureOpenAI && (!provider || provider === 'openai')) {
    return { ...(modelName ? { model: modelName } : {}), streaming };
  }

  if (useAzureOpenAI) {
    if (!endpoint || !modelName) {
      throw new Error('AZURE_OPENAI_ENDPOINT and MODEL_NAME are required to use Azure OpenAI / Foundry model serving');
    }

    // Prefer an explicit API key; fall back to DefaultAzureCredential (requires az login / managed identity)
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    let auth: { apiKey?: string; bearerToken?: string };
    if (apiKey && apiKey.trim()) {
      auth = { apiKey: apiKey.trim() };
    } else {
      const { DefaultAzureCredential } = await import('@azure/identity');
      const tenantId = process.env.AZURE_TENANT_ID?.trim() || undefined;
      const credential = new DefaultAzureCredential(tenantId ? { tenantId } : undefined);
      const tokenResult = await credential.getToken(AZURE_OPENAI_SCOPE);
      if (!tokenResult) throw new Error('Failed to acquire Azure bearer token. Set AZURE_OPENAI_API_KEY or run "az login".');
      auth = { bearerToken: tokenResult.token };
    }

    return {
      model: modelName,
      streaming,
      provider: {
        type: 'openai', // Azure AI Foundry (OpenAI-Compatible Endpoint)
        baseUrl: endpoint.replace(/\/$/, ''), // "https://your-resource.openai.azure.com/openai/v1/"
        ...auth,
        wireApi: "responses",  // For GPT-5 series models
      },
    };
  }

  throw new Error(`Unknown MODEL_PROVIDER: ${provider}`);
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface WorkspaceContext {
  title: string;
  slides: SlideItem[];
  designBrief: DesignBrief | null;
  framework: FrameworkType | null;
  theme: ThemeTokens | null;
  dataSources: DataFile[];
  urlSources: Array<{ url: string; status: string; result?: ScrapeResult }>;
  iconProvider: 'iconify';
  iconCollection: IconifyCollectionId;
  availableIcons: string[];
}

function truncateText(value: string, maxLen: number): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLen) return compact;
  return `${compact.slice(0, maxLen)}...`;
}

function formatFileSource(ds: DataFile): string[] {
  const parts = [`- **${ds.name}** (${ds.type.toUpperCase()}): ${ds.summary}`];
  if (ds.consumed) {
    parts.push(`  Summary file: ${ds.consumed.summaryPath}`);
    parts.push(ds.consumed.summaryText);
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

function formatUrlSource(entry: WorkspaceContext['urlSources'][number]): string[] {
  const parts = [`- **${entry.url}** (${entry.status})`];
  if (entry.result?.error) {
    parts.push(`  Error: ${entry.result.error}`);
    return parts;
  }
  if (entry.result?.consumed) {
    parts.push(`  Summary file: ${entry.result.consumed.summaryPath}`);
    parts.push(entry.result.consumed.summaryText);
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

function buildPrompt(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  workspace: WorkspaceContext,
): string {
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
    if (workspace.slides.length > 0) {
      parts.push(`Slides: ${workspace.slides.length} slides (${workspace.slides.map((s) => s.title).join(', ')})`);
    }
    if (workspace.theme) {
      parts.push(`Theme: "${workspace.theme.name}" — Primary: #${workspace.theme.C.PRIMARY}, Accent: #${workspace.theme.C.ACCENT1}`);
    }
    parts.push('');
  }

  // Data sources
  if (workspace.dataSources.length > 0) {
    parts.push('## Available File Data Sources\n');
    for (const ds of workspace.dataSources) {
      parts.push(...formatFileSource(ds));
    }
    parts.push('');
  }

  if (workspace.urlSources.length > 0) {
    parts.push('## Available URL Sources\n');
    for (const entry of workspace.urlSources) {
      parts.push(...formatUrlSource(entry));
    }
    parts.push('');
  }

  if (workspace.theme) {
    parts.push('## Active Theme Palette\n');
    parts.push(`Theme name: ${workspace.theme.name}`);
    parts.push(`Semantic colors: PRIMARY=#${workspace.theme.C.PRIMARY}, SECONDARY=#${workspace.theme.C.SECONDARY}, BG=#${workspace.theme.C.BG}, TEXT=#${workspace.theme.C.TEXT}, ACCENT3=#${workspace.theme.C.ACCENT3}, ACCENT4=#${workspace.theme.C.ACCENT4}`);
    if (workspace.theme.colors.length > 0) {
      parts.push(`Palette colors: ${workspace.theme.colors.slice(0, 20).map((color) => `${color.name} ${color.hex}`).join(' | ')}`);
    }
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

// ---------------------------------------------------------------------------
// IPC handler registration
// ---------------------------------------------------------------------------

export function registerChatHandlers(getWindow: () => BrowserWindow | null): void {
  // Reset the Copilot client singleton whenever the user saves new settings
  // so the next chat:send picks up the updated token / endpoint.
  onSettingsSaved(() => { clientInstance = null; });

  ipcMain.on('chat:send', (_event, payload: {
    message: string;
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    workspace: WorkspaceContext;
  }) => {
    void (async () => {
      const win = getWindow();
      if (!win) return;

      const { message, history, workspace } = payload;

      // Validate
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        win.webContents.send('chat:error', 'Message must not be empty');
        return;
      }

      const prompt = buildPrompt(message, history, workspace);

      let session: Awaited<ReturnType<CopilotClient['createSession']>> | null = null;

      // Tool factories (close over win for IPC emission)
      const scenarioTool = defineTool('set_scenario', {
      description:
        'Set the slide scenario (outline) for the presentation workspace panel. ' +
        'Each slide must have a keyMessage (the "so what" / key takeaway), a layout hint, and optionally an icon hint. ' +
        'You may also include imageQuery when a supporting downloaded image should be used on the slide. ' +
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
      description: 'Update a single slide in the existing scenario. Use when the user asks to change a specific slide. You may also update imageQuery to change the downloaded image used for the slide.',
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

      const skillDirs = [
        path.join(app.getAppPath(), 'skills', 'create-slide-story'),
        path.join(app.getAppPath(), 'skills', 'generate-pptx'),
      ];

      const buildSessionConfig = (opts: Partial<SessionConfig>): SessionConfig => ({
        ...opts,
        tools: [scenarioTool, updateSlideTool, suggestFrameworkTool],
        skillDirectories: skillDirs,
        systemMessage: {
          mode: 'append' as const,
          content:
            'You are an expert presentation designer and business consultant that helps create professional PowerPoint decks. ' +
            'Always respond in the same language as the user. ' +
            'Use the provided file contents, scraped URL contents, active theme palette, and available icons as grounding context for slide creation and PPTX generation. ' +
            'When creating a presentation outline, FIRST use suggest_framework to recommend and justify a framework, ' +
            'THEN use set_scenario to send the full scenario to the workspace panel. ' +
            'When generating PPTX, treat slide layout and icon values as hints rather than rigid instructions, and choose a stronger visual composition when it communicates the approved story better. ' +
            'When a slide has imageQuery, expect the app to download a supporting image into the workspace images folder and use it in preview/export. ' +
            'When generating PPTX, reflect the active palette through the provided C color constants, and distribute accent usage across the full theme instead of relying only on ACCENT1 and ACCENT2 when ACCENT3-ACCENT6 are available. ' +
            'Use available icons through the provided icon helpers when appropriate. ' +
            'When the user asks for PPTX generation, output the final JavaScript code block directly instead of narrating in-progress status updates like "Generating the PPTX now". ' +
            'When updating a single slide, use update_slide. ' +
            'Never output slide listings in the chat message itself. ' +
            'Keep chat messages short — action summaries only. ' +
            'Use strong action-title headlines for every slide.',
        },
        onPermissionRequest: approveAll,
      });

      const wireSession = (s: typeof session) => {
        s!.on('assistant.reasoning_delta', (event) => {
          const delta = event.data?.deltaContent ?? '';
          if (delta) win.webContents.send('chat:stream', { thinking: delta });
        });
        s!.on('assistant.message_delta', (event) => {
          const delta = event.data?.deltaContent ?? '';
          if (delta) win.webContents.send('chat:stream', { content: delta });
        });
        s!.on('session.error', (event) => {
          const msg = event.data?.message ?? 'Unknown error';
          win.webContents.send('chat:error', msg);
        });
      };

      try {
        const copilot = await getCopilotClient();
        const sessionOpts = await getSessionOptions({ streaming: true });

        session = await copilot.createSession(buildSessionConfig(sessionOpts));
        wireSession(session);

        await session.sendAndWait({ prompt }, 600_000);

        win.webContents.send('chat:done');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        win.webContents.send('chat:error', msg);
      } finally {
        if (session) await session.disconnect().catch(() => {});
      }
    })().catch((err) => {
      const win = getWindow();
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (win) {
        win.webContents.send('chat:error', msg);
      }
      console.error('[chat:send] Unhandled error', err);
    });
  });
}
