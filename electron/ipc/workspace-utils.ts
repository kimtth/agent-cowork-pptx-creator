import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

function workspaceConfigPath(): string {
  return path.join(app.getPath('userData'), 'workspace.json');
}

export async function readWorkspaceDir(): Promise<string> {
  try {
    const raw = await fs.readFile(workspaceConfigPath(), 'utf-8');
    const parsed = JSON.parse(raw) as { dir?: string };
    if (parsed.dir) return parsed.dir;
  } catch {
    // fall through to default
  }

  const defaultDir = path.join(app.getPath('documents'), 'PPTX Slide Agent');
  await fs.mkdir(defaultDir, { recursive: true });
  await writeWorkspaceDir(defaultDir);
  return defaultDir;
}

export async function writeWorkspaceDir(dir: string): Promise<void> {
  const cfg = workspaceConfigPath();
  await fs.mkdir(path.dirname(cfg), { recursive: true });
  await fs.writeFile(cfg, JSON.stringify({ dir }, null, 2), 'utf-8');
}
