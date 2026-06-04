/**
 * Copilot LLM Adapter
 *
 * Wraps the existing @github/copilot-sdk flow behind the LLMProvider
 * contract.  Preserves native CLI resolution, skillDirectories,
 * approveAll, and Copilot-specific streaming events.
 */

import { CopilotClient, defineTool, approveAll } from '@github/copilot-sdk';
import type { SessionConfig } from '@github/copilot-sdk';
import { normalizeGitHubToken, resolveCopilotCliPath } from './copilot-runtime.ts';
import type {
  LLMProvider,
  LLMProviderCapabilities,
  LLMSession,
  LLMSessionConfig,
  LLMStreamDelta,
  LLMToolDefinition,
  LLMUsageSummary,
} from './llm-provider.ts';

// ---------------------------------------------------------------------------
// Copilot client singleton
// ---------------------------------------------------------------------------

let clientInstance: CopilotClient | null = null;

function getCopilotClient(): CopilotClient {
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

// ---------------------------------------------------------------------------
// Session options
// ---------------------------------------------------------------------------

function resolveReasoningEffort(): 'low' | 'medium' | 'high' | undefined {
  const value = process.env.REASONING_EFFORT?.trim().toLowerCase();
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return undefined;
}

function getSessionOptions(config: LLMSessionConfig): Partial<SessionConfig> {
  const modelName = config.model ?? process.env.MODEL_NAME;
  const streaming = config.streaming ?? false;
  const reasoningEffort = config.reasoningEffort ?? resolveReasoningEffort();

  const effort = reasoningEffort ? { reasoningEffort } : {};
  return { ...(modelName ? { model: modelName } : {}), streaming, ...effort };
}

// ---------------------------------------------------------------------------
// Tool conversion: LLMToolDefinition → Copilot SDK tool
// ---------------------------------------------------------------------------

function convertTools(tools: LLMToolDefinition[]) {
  return tools.map((t) =>
    defineTool(t.name, {
      description: t.description,
      parameters: t.parameters as any,
      handler: t.handler as any,
    }),
  );
}

// ---------------------------------------------------------------------------
// LLMProvider implementation
// ---------------------------------------------------------------------------

export const copilotProvider: LLMProvider = {
  id: 'copilot',

  capabilities: {
    supportsToolCalls: true,
    supportsReasoningDeltas: true,
    supportsSkillDirectories: true,
  } satisfies LLMProviderCapabilities,

  reset(): void {
    clientInstance = null;
  },

  async createSession(
    config: LLMSessionConfig,
    onDelta: (delta: LLMStreamDelta) => void,
  ): Promise<LLMSession> {
    const copilot = getCopilotClient();
    const sessionOpts = getSessionOptions(config);

    const copilotConfig: SessionConfig = {
      ...sessionOpts,
      tools: convertTools(config.tools),
      ...(config.skillDirectories?.length
        ? { skillDirectories: config.skillDirectories }
        : {}),
      systemMessage: {
        mode: 'append' as const,
        content: config.systemMessage,
      },
      onPermissionRequest: approveAll,
    };

    const session = await copilot.createSession(copilotConfig);
    let pendingUsage: LLMUsageSummary | null = null;

    // Wire streaming events → normalized deltas
    session.on('assistant.reasoning_delta', (event) => {
      const text = event.data?.deltaContent ?? '';
      if (text) onDelta({ type: 'thinking', text });
    });
    session.on('assistant.message_delta', (event) => {
      const text = event.data?.deltaContent ?? '';
      if (text) onDelta({ type: 'content', text });
    });
    session.on('session.error', (event) => {
      const message = event.data?.message ?? 'Unknown Copilot session error';
      onDelta({ type: 'error', message });
    });
    session.on('assistant.usage', (event) => {
      const inputTokens = event.data?.inputTokens;
      const outputTokens = event.data?.outputTokens;
      const cacheReadTokens = event.data?.cacheReadTokens;
      const cacheWriteTokens = event.data?.cacheWriteTokens;
      const totalTokens = [inputTokens, outputTokens].every((value) => typeof value === 'number')
        ? (inputTokens ?? 0) + (outputTokens ?? 0)
        : undefined;

      pendingUsage = {
        provider: 'copilot',
        model: typeof event.data?.model === 'string' && event.data.model.trim()
          ? event.data.model
          : pendingUsage?.model ?? config.model,
        inputTokens: (pendingUsage?.inputTokens ?? 0) + (inputTokens ?? 0),
        outputTokens: (pendingUsage?.outputTokens ?? 0) + (outputTokens ?? 0),
        totalTokens: (pendingUsage?.totalTokens ?? 0) + (totalTokens ?? 0),
        cacheReadTokens: (pendingUsage?.cacheReadTokens ?? 0) + (cacheReadTokens ?? 0),
        cacheWriteTokens: (pendingUsage?.cacheWriteTokens ?? 0) + (cacheWriteTokens ?? 0),
        cost: (pendingUsage?.cost ?? 0) + (event.data?.cost ?? 0),
      };
    });

    return {
      async sendAndWait(prompt: string, timeoutMs: number): Promise<void> {
        pendingUsage = null;
        await session.sendAndWait({ prompt }, timeoutMs);
        if (pendingUsage) {
          onDelta({ type: 'usage', usage: pendingUsage });
        }
      },
      async cancel(): Promise<void> {
        await session.disconnect().catch(() => {});
      },
      async disconnect(): Promise<void> {
        await session.disconnect().catch(() => {});
      },
    };
  },
};
