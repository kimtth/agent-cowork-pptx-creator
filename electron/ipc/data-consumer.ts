import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { promisify } from 'util';
import { execFile } from 'child_process';
import type { DataFile, ScrapeResult, SourceArtifact } from '../../src/domain/ports/ipc';
import { readWorkspaceDir } from './workspace-utils.ts';

const execFileAsync = promisify(execFile);
const MAX_SUMMARY_LEN = 1800;

interface ConversionResult {
  title: string;
  markdown: string;
}

interface FallbackSourceInput {
  title?: string;
  text: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'source';
}

function hashValue(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 10);
}

function contentsDir(workspaceDir: string): string {
  return path.join(workspaceDir, 'contents');
}

function sourceArtifactsDir(workspaceDir: string): string {
  return path.join(contentsDir(workspaceDir), 'data-sources');
}

function localMarkItDownPythonCandidates(): string[] {
  const baseDir = path.resolve(process.cwd(), '.venv-markitdown');
  return process.platform === 'win32'
    ? [path.join(baseDir, 'Scripts', 'python.exe')]
    : [path.join(baseDir, 'bin', 'python')];
}

async function ensureArtifactsDir(): Promise<string> {
  const workspaceDir = await readWorkspaceDir();
  await fs.mkdir(contentsDir(workspaceDir), { recursive: true });
  const dir = sourceArtifactsDir(workspaceDir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function resolvePythonExecutable(): Promise<string> {
  const candidates: string[] = [];

  const explicit = process.env.PPTX_SLIDE_AGENT_PYTHON?.trim();
  if (explicit) candidates.push(explicit);

  candidates.push(...localMarkItDownPythonCandidates());

  const uvPythonRoot = process.env.APPDATA
    ? path.join(process.env.APPDATA, 'uv', 'python')
    : '';
  if (uvPythonRoot) {
    try {
      const entries = await fs.readdir(uvPythonRoot, { withFileTypes: true });
      const versions = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(uvPythonRoot, entry.name, 'python.exe'))
        .reverse();
      candidates.push(...versions);
    } catch {
      // ignore missing uv installs
    }
  }

  candidates.push('python');

  for (const candidate of candidates) {
    try {
      if (candidate.includes(path.sep) && !existsSync(candidate)) continue;
      await execFileAsync(candidate, ['-c', 'import sys; print(sys.executable)'], { timeout: 30_000, windowsHide: true });
      return candidate;
    } catch {
      // try next
    }
  }

  throw new Error('Python 3.10+ is required for MarkItDown ingestion. Run "pnpm setup:markitdown" or set PPTX_SLIDE_AGENT_PYTHON to a working interpreter.');
}

function markitdownScriptPath(): string {
  return path.resolve(process.cwd(), 'scripts', 'markitdown_convert.py');
}

async function runMarkItDown(source: string): Promise<ConversionResult> {
  const python = await resolvePythonExecutable();
  const scriptPath = markitdownScriptPath();
  const { stdout } = await execFileAsync(
    python,
    [scriptPath, '--source', source],
    { timeout: 120_000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
  );

  const parsed = JSON.parse(stdout) as { ok: boolean; markdown?: string; title?: string; error?: string };
  if (!parsed.ok || !parsed.markdown) {
    throw new Error(parsed.error || 'MarkItDown conversion failed');
  }

  return {
    title: parsed.title?.trim() || '',
    markdown: parsed.markdown,
  };
}

function summarizeMarkdown(label: string, markdown: string, sourceType: 'file' | 'url', title?: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const headings = lines
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.replace(/^#{1,6}\s+/, '').trim())
    .filter(Boolean)
    .slice(0, 6);

  const bullets = lines
    .filter((line) => /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line))
    .map((line) => line.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, '').trim())
    .filter(Boolean)
    .slice(0, 10);

  const paragraphs = lines
    .map((line) => line.trim())
    .filter((line) => line.length > 40 && !/^#{1,6}\s+/.test(line) && !/^\|/.test(line) && !/^```/.test(line))
    .slice(0, 4);

  const tableLines = lines.filter((line) => /^\|.*\|$/.test(line.trim())).slice(0, 6);
  const summaryParts = [
    `# Source Summary`,
    `- Label: ${label}`,
    `- Type: ${sourceType}`,
  ];

  if (title) summaryParts.push(`- Title: ${title}`);
  if (headings.length > 0) {
    summaryParts.push('', '## Key Sections');
    summaryParts.push(...headings.map((heading) => `- ${heading}`));
  }
  if (bullets.length > 0) {
    summaryParts.push('', '## Key Points');
    summaryParts.push(...bullets.map((bullet) => `- ${bullet}`));
  }
  if (paragraphs.length > 0) {
    summaryParts.push('', '## Excerpts');
    summaryParts.push(...paragraphs.map((paragraph) => `- ${paragraph}`));
  }
  if (tableLines.length > 0) {
    summaryParts.push('', '## Table Samples');
    summaryParts.push(...tableLines);
  }

  const summary = summaryParts.join('\n').trim();
  return summary.length <= MAX_SUMMARY_LEN ? summary : `${summary.slice(0, MAX_SUMMARY_LEN)}...`;
}

async function writeArtifacts(sourceId: string, title: string, markdown: string, summaryText: string): Promise<SourceArtifact> {
  const dir = await ensureArtifactsDir();
  const baseName = `${slugify(title || sourceId)}-${hashValue(sourceId)}`;
  const markdownPath = path.join(dir, `${baseName}.source.md`);
  const summaryPath = path.join(dir, `${baseName}.summary.md`);
  await fs.writeFile(markdownPath, markdown, 'utf-8');
  await fs.writeFile(summaryPath, summaryText, 'utf-8');
  return { markdownPath, summaryPath, summaryText };
}

async function consumeSource(
  sourceId: string,
  sourceType: 'file' | 'url',
  fallback: FallbackSourceInput,
): Promise<{ artifact: SourceArtifact; title: string; markdown: string }> {
  await ensureArtifactsDir();

  let converted: ConversionResult;
  try {
    converted = await runMarkItDown(sourceId);
  } catch {
    converted = {
      title: fallback.title ?? '',
      markdown: fallback.text,
    };
  }

  const title = converted.title || fallback.title || path.basename(sourceId);
  const summaryText = summarizeMarkdown(title, converted.markdown, sourceType, converted.title || fallback.title);
  const artifact = await writeArtifacts(sourceId, title, converted.markdown, summaryText);
  return { artifact, title, markdown: converted.markdown };
}

export async function consumeFileData(
  file: DataFile,
  fallbackText: string,
): Promise<DataFile> {
  const consumed = await consumeSource(file.path, 'file', { title: file.name, text: fallbackText });
  return {
    ...file,
    text: consumed.markdown.slice(0, 8192),
    summary: consumed.artifact.summaryText.replace(/\s+/g, ' ').slice(0, 300),
    consumed: consumed.artifact,
  };
}

export async function consumeUrlData(
  url: string,
  fallback: { title: string; text: string; lists: string[] },
): Promise<ScrapeResult> {
  const fallbackText = [fallback.title, fallback.text, ...fallback.lists].filter(Boolean).join('\n\n');
  const consumed = await consumeSource(url, 'url', { title: fallback.title || url, text: fallbackText });

  const listLines = consumed.artifact.summaryText
    .split('\n')
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-\s+/, '').trim())
    .slice(0, 10);

  return {
    url,
    title: consumed.title,
    text: consumed.markdown.slice(0, 8192),
    lists: listLines,
    consumed: consumed.artifact,
  };
}
