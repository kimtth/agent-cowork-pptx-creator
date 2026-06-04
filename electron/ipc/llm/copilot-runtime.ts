import { createRequire } from 'module';
import { resolveBundledPath } from '../project/workspace-utils.ts';

const require = createRequire(import.meta.url);

export function resolveWorkflowInstructionPath(fileName: string): string {
  return resolveBundledPath('workflows', fileName);
}

export function normalizeGitHubToken(value: string | undefined): string | undefined {
  const raw = (value ?? '').trim();
  if (!raw) return undefined;
  const noBearer = raw.replace(/^Bearer\s+/i, '');
  const unquoted = noBearer.replace(/^['\"](.*)['\"]$/, '$1').trim();
  return unquoted || undefined;
}

export function resolveCopilotCliPath(): string {
  const nativePkg = `@github/copilot-${process.platform}-${process.arch}`;
  let resolved = require.resolve(nativePkg);
  // Native executables can't run from inside an asar archive.
  // electron-builder's asarUnpack extracts them to app.asar.unpacked/.
  if (resolved.includes('app.asar') && !resolved.includes('app.asar.unpacked')) {
    resolved = resolved.replace('app.asar', 'app.asar.unpacked');
  }
  return resolved;
}