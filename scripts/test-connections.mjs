import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createRequire } from 'node:module';
import { DefaultAzureCredential } from '@azure/identity';

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const COPILOT_PROMPT = 'Reply with exactly OK.';
const AZURE_TEST_MAX_TOKENS = 128;
const AZURE_SCOPES = [
  'https://cognitiveservices.azure.com/.default',
];

function normalizeUrl(value) {
  return String(value).replace(/\/$/, '');
}

function normalizeGitHubToken(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return undefined;
  const noBearer = raw.replace(/^Bearer\s+/i, '');
  const unquoted = noBearer.replace(/^['\"](.*)['\"]$/, '$1').trim();
  return unquoted || undefined;
}

async function readSettingsFile() {
  const settingsPath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'pptx-slide-agent', 'settings.json');
  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getValue(settings, key) {
  const envValue = process.env[key];
  if (envValue && envValue.trim()) return envValue.trim();
  const savedValue = settings[key];
  if (typeof savedValue === 'string' && savedValue.trim()) return savedValue.trim();
  return undefined;
}

function getCopilotCliPath() {
  return require.resolve(`@github/copilot-${process.platform}-${process.arch}`);
}

function extractAzureOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const textParts = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === 'string') textParts.push(part.text);
    }
  }
  return textParts.join('\n').trim();
}

function extractChatCompletionText(payload) {
  const choices = Array.isArray(payload?.choices) ? payload.choices : [];
  const parts = [];
  for (const choice of choices) {
    const content = choice?.message?.content;
    if (typeof content === 'string') {
      parts.push(content);
      continue;
    }
    if (Array.isArray(content)) {
      for (const part of content) {
        if (typeof part?.text === 'string') parts.push(part.text);
      }
    }
  }
  return parts.join('\n').trim();
}

function summarizePayload(payload) {
  return JSON.stringify({
    id: payload?.id,
    object: payload?.object,
    model: payload?.model,
    status: payload?.status,
    output_text: payload?.output_text,
    output_count: Array.isArray(payload?.output) ? payload.output.length : undefined,
    choices_count: Array.isArray(payload?.choices) ? payload.choices.length : undefined,
    finish_reason: payload?.choices?.[0]?.finish_reason,
    incomplete_details: payload?.incomplete_details,
    usage: payload?.usage,
  });
}

async function postAzureJson(url, headers, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let payload = null;
  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  return { response, rawText, payload };
}

async function testCopilot(settings) {
  const token = normalizeGitHubToken(getValue(settings, 'GITHUB_TOKEN'));
  if (!token) {
    return { name: 'Copilot', ok: false, skipped: true, message: 'GITHUB_TOKEN is not set.' };
  }

  const cliPath = getCopilotCliPath();
  const env = {
    ...process.env,
    COPILOT_GITHUB_TOKEN: token,
    GH_TOKEN: token,
    GITHUB_TOKEN: token,
  };

  const { stdout } = await execFileAsync(
    cliPath,
    ['--auth-token-env', 'COPILOT_TEST_TOKEN', '--no-auto-login', '--allow-all', '-s', '-p', COPILOT_PROMPT],
    {
      env: {
        ...env,
        COPILOT_TEST_TOKEN: token,
      },
      timeout: 180000,
      maxBuffer: 1024 * 1024,
    },
  );

  const reply = stdout.trim();
  if (reply !== 'OK') {
    throw new Error(`Unexpected Copilot reply: ${JSON.stringify(reply)}`);
  }

  return { name: 'Copilot', ok: true, message: 'Authenticated and returned OK.' };
}

async function getAzureAuthCandidates(settings) {
  const apiKey = getValue(settings, 'AZURE_OPENAI_API_KEY');
  if (apiKey) {
    return [{ type: 'api-key', value: apiKey, label: 'api-key' }];
  }

  const tenantId = getValue(settings, 'AZURE_TENANT_ID');
  const credential = new DefaultAzureCredential(tenantId ? { tenantId } : undefined);
  const candidates = [];

  for (const scope of AZURE_SCOPES) {
    const tokenResult = await credential.getToken(scope);
    if (tokenResult?.token) {
      candidates.push({ type: 'bearer', value: tokenResult.token, label: scope });
    }
  }

  if (candidates.length === 0) {
    throw new Error('Failed to acquire Azure bearer token. Set AZURE_OPENAI_API_KEY or run az login.');
  }

  return candidates;
}

async function testAzure(settings) {
  const endpoint = getValue(settings, 'AZURE_OPENAI_ENDPOINT');
  const model = getValue(settings, 'MODEL_NAME');
  const provider = getValue(settings, 'MODEL_PROVIDER');

  if (!endpoint) {
    return { name: 'Azure', ok: false, skipped: true, message: 'AZURE_OPENAI_ENDPOINT is not set.' };
  }
  if (!model) {
    return { name: 'Azure', ok: false, skipped: true, message: 'MODEL_NAME is not set.' };
  }

  const authCandidates = await getAzureAuthCandidates(settings);
  const baseUrl = normalizeUrl(endpoint);
  const url = `${baseUrl}/responses`;
  let lastError;

  for (const auth of authCandidates) {
    const headers = { 'content-type': 'application/json' };
    if (auth.type === 'api-key') {
      headers['api-key'] = auth.value;
    } else {
      headers.authorization = `Bearer ${auth.value}`;
    }

    const responsesResult = await postAzureJson(url, headers, {
      model,
      input: COPILOT_PROMPT,
      max_output_tokens: AZURE_TEST_MAX_TOKENS,
    });

    if (!responsesResult.response.ok) {
      lastError = `Azure HTTP ${responsesResult.response.status} from ${baseUrl} via ${auth.label}: ${responsesResult.rawText.slice(0, 500)}`;
      if (responsesResult.response.status === 401 || responsesResult.response.status === 403) continue;
      throw new Error(lastError);
    }

    const responsesReply = extractAzureOutputText(responsesResult.payload);
    if (responsesReply === 'OK') {
      const providerSuffix = provider ? ` (MODEL_PROVIDER=${provider})` : '';
      return { name: 'Azure', ok: true, message: `Connected to ${baseUrl} with model ${model} via /responses and returned OK via ${auth.label}${providerSuffix}.` };
    }

    const chatUrl = `${baseUrl}/chat/completions`;
    const chatResult = await postAzureJson(chatUrl, headers, {
      model,
      messages: [{ role: 'user', content: COPILOT_PROMPT }],
      max_completion_tokens: AZURE_TEST_MAX_TOKENS,
    });

    if (!chatResult.response.ok) {
      lastError = `Azure /responses returned ${JSON.stringify(responsesReply)} with payload ${summarizePayload(responsesResult.payload)}. /chat/completions then failed with HTTP ${chatResult.response.status}: ${chatResult.rawText.slice(0, 500)}`;
      if (chatResult.response.status === 401 || chatResult.response.status === 403) continue;
      throw new Error(lastError);
    }

    const chatReply = extractChatCompletionText(chatResult.payload);
    if (chatReply === 'OK') {
      const providerSuffix = provider ? ` (MODEL_PROVIDER=${provider})` : '';
      return { name: 'Azure', ok: true, message: `Connected to ${baseUrl} with model ${model} via /chat/completions after empty /responses output via ${auth.label}${providerSuffix}.` };
    }

    throw new Error(
      `Unexpected Azure replies from ${baseUrl} via ${auth.label}. ` +
      `/responses reply=${JSON.stringify(responsesReply)} payload=${summarizePayload(responsesResult.payload)}; ` +
      `/chat/completions reply=${JSON.stringify(chatReply)} payload=${summarizePayload(chatResult.payload)}`,
    );
  }

  throw new Error(lastError ?? 'Azure request failed.');
}

async function main() {
  const settings = await readSettingsFile();
  const args = new Set(process.argv.slice(2));
  const shouldRunCopilot = !args.has('--azure-only');
  const shouldRunAzure = !args.has('--copilot-only');
  const results = [];

  if (shouldRunCopilot) {
    try {
      results.push(await testCopilot(settings));
    } catch (error) {
      results.push({ name: 'Copilot', ok: false, message: error instanceof Error ? error.message : String(error) });
    }
  }

  if (shouldRunAzure) {
    try {
      results.push(await testAzure(settings));
    } catch (error) {
      results.push({ name: 'Azure', ok: false, message: error instanceof Error ? error.message : String(error) });
    }
  }

  let hasFailure = false;
  for (const result of results) {
    const prefix = result.skipped ? 'SKIP' : result.ok ? 'PASS' : 'FAIL';
    console.log(`${prefix} ${result.name}: ${result.message}`);
    if (!result.ok && !result.skipped) hasFailure = true;
  }

  if (hasFailure) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`FAIL Script: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  process.exitCode = 1;
});