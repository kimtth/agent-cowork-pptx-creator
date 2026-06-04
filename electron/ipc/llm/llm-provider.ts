/**
 * LLM Provider Contract
 *
 * Normalized interface for chat/streaming/tool-calling through GitHub Copilot.
 */

// ---------------------------------------------------------------------------
// Tool definition
// ---------------------------------------------------------------------------

/** JSON Schema object for tool parameters. */
export type ToolParametersSchema = {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
};

/** Tool definition exposed to Copilot. */
export interface LLMToolDefinition {
  name: string;
  description: string;
  parameters: ToolParametersSchema;
  handler: (args: any) => Promise<{ success: boolean; message?: string; error?: string; content?: string }>;
}

export interface LLMUsageSummary {
  provider: 'copilot';
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  finishReason?: string;
  cost?: number;
}

// ---------------------------------------------------------------------------
// Stream events — normalized for the renderer
// ---------------------------------------------------------------------------

export type LLMStreamDelta =
  | { type: 'content'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'usage'; usage: LLMUsageSummary }
  | { type: 'error'; message: string };

// ---------------------------------------------------------------------------
// Session configuration
// ---------------------------------------------------------------------------

export interface LLMSessionConfig {
  /** System prompt (appended or replaced depending on provider). */
  systemMessage: string;
  /** Tool definitions exposed to Copilot. */
  tools: LLMToolDefinition[];
  /** Skill / instruction directories passed to Copilot. */
  skillDirectories?: string[];
  /** GitHub-hosted Copilot model name. */
  model?: string;
  /** Enable streaming. */
  streaming?: boolean;
  /** Reasoning effort hint. */
  reasoningEffort?: 'low' | 'medium' | 'high';
}

// ---------------------------------------------------------------------------
// Session handle
// ---------------------------------------------------------------------------

export interface LLMSession {
  /** Send a user prompt and wait for completion (handles tool loop internally). */
  sendAndWait(prompt: string, timeoutMs: number): Promise<void>;
  /** Cancel an in-flight request. */
  cancel(): Promise<void>;
  /** Release resources. */
  disconnect(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Provider capabilities
// ---------------------------------------------------------------------------

export interface LLMProviderCapabilities {
  supportsToolCalls: boolean;
  supportsReasoningDeltas: boolean;
  supportsSkillDirectories: boolean;
}

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface LLMProvider {
  readonly id: string;
  readonly capabilities: LLMProviderCapabilities;

  /** Create a session with the given config. */
  createSession(
    config: LLMSessionConfig,
    onDelta: (delta: LLMStreamDelta) => void,
  ): Promise<LLMSession>;

  /** Reset any cached clients (e.g. after settings change). */
  reset(): void;
}

