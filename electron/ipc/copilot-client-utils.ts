import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export function normalizeGitHubToken(value: string | undefined): string | undefined {
  const raw = (value ?? '').trim();
  if (!raw) return undefined;
  const noBearer = raw.replace(/^Bearer\s+/i, '');
  const unquoted = noBearer.replace(/^['\"](.*)['\"]$/, '$1').trim();
  return unquoted || undefined;
}

export function resolveCopilotCliPath(): string {
  const nativePkg = `@github/copilot-${process.platform}-${process.arch}`;
  return require.resolve(nativePkg);
}