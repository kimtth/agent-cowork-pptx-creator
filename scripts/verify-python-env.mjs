import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pythonPath = process.platform === 'win32'
  ? path.join(projectRoot, '.venv', 'Scripts', 'python.exe')
  : path.join(projectRoot, '.venv', 'bin', 'python');

async function main() {
  try {
    await access(pythonPath);
  } catch {
    console.error([
      'Managed Python environment not found at:',
      `  ${pythonPath}`,
      '',
      'dist:skip-venv skips environment creation, but the packaged app still needs .venv bundled into resources.',
      'Run "pnpm setup:python-env" first, then rerun "pnpm dist:skip-venv".',
    ].join('\n'));
    process.exitCode = 1;
  }
}

main();