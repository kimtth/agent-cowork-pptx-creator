import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = process.cwd();
const venvDir = path.join(rootDir, '.venv-markitdown');
const pythonPath = process.platform === 'win32'
  ? path.join(venvDir, 'Scripts', 'python.exe')
  : path.join(venvDir, 'bin', 'python');
const requirementsPath = path.join(rootDir, 'requirements-markitdown.txt');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`));
    });
  });
}

async function fileExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Setting up local MarkItDown environment with uv...');

  const hasPython = await fileExists(pythonPath);
  if (!hasPython) {
    await run('uv', ['venv', '.venv-markitdown', '--python', '3.13']);
  } else {
    console.log(`Using existing environment: ${venvDir}`);
  }

  await run('uv', ['pip', 'install', '--link-mode=copy', '--python', pythonPath, '-r', requirementsPath]);
  await run(pythonPath, ['-c', 'from markitdown import MarkItDown; print(MarkItDown.__name__)']);

  console.log('MarkItDown environment is ready.');
  console.log(`Python: ${pythonPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});