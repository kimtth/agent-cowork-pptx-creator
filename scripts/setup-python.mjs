import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const venvName = '.venv-markitdown';
const venvDir = path.join(projectRoot, venvName);
const pythonPath = process.platform === 'win32'
  ? path.join(venvDir, 'Scripts', 'python.exe')
  : path.join(venvDir, 'bin', 'python');
const pyprojectPath = path.join(projectRoot, 'pyproject.toml');
const defaultPythonVersion = '3.13';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
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

function parseMinimumPythonVersion(specifier) {
  const match = String(specifier ?? '').match(/>=\s*(\d+(?:\.\d+)+)/);
  return match?.[1] ?? defaultPythonVersion;
}

function parseDependencyList(pyprojectText) {
  const match = pyprojectText.match(/(^|\n)dependencies\s*=\s*\[(?<entries>[\s\S]*?)\n\]/m);
  const entries = match?.groups?.entries;
  if (!entries) {
    throw new Error(`No project dependencies were found in ${pyprojectPath}.`);
  }

  return [...entries.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)].map(([, value]) => value);
}

async function loadProjectConfig() {
  const pyprojectText = await readFile(pyprojectPath, 'utf8');
  const requiresPythonMatch = pyprojectText.match(/(^|\n)requires-python\s*=\s*"([^"]+)"/m);

  return {
    pythonVersion: parseMinimumPythonVersion(requiresPythonMatch?.[2]),
    dependencies: parseDependencyList(pyprojectText),
  };
}

async function ensureVirtualEnv(pythonVersion) {
  const hasPython = await fileExists(pythonPath);
  if (hasPython) {
    console.log(`Using existing environment: ${venvDir}`);
    return;
  }

  await run('uv', ['venv', venvName, '--python', pythonVersion]);
}

async function installDependencies(dependencies) {
  if (dependencies.length === 0) {
    console.log('No Python dependencies declared in pyproject.toml.');
    return;
  }

  await run('uv', ['pip', 'install', '--link-mode=copy', '--python', pythonPath, ...dependencies]);
}

async function verifyEnvironment() {
  await run(pythonPath, ['-c', 'from icrawler import __name__ as icrawler_name; from markitdown import MarkItDown; import pptx; print(icrawler_name, MarkItDown.__name__, pptx.__name__)']);
}

async function main() {
  console.log('Setting up local Python environment from pyproject.toml with uv...');

  const projectConfig = await loadProjectConfig();
  await ensureVirtualEnv(projectConfig.pythonVersion);
  await installDependencies(projectConfig.dependencies);
  await verifyEnvironment();

  console.log('Python environment is ready.');
  console.log(`Python: ${pythonPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});