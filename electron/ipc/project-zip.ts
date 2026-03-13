/**
 * ZIP-based .pptapp file format (v2).
 *
 * Structure inside the ZIP:
 *   manifest.json   — project JSON with relative image paths
 *   images/         — slide images (JPG/PNG/WebP)
 *   previews/       — rendered slide PNGs (if available)
 */

import fs from 'fs/promises';
import fss from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import archiver from 'archiver';
import AdmZip from 'adm-zip';

// ── Types ────────────────────────────────────────────────────────────────────

interface SlideSelectedImage {
  id: string;
  imageQuery: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  imageAttribution: string | null;
  sourcePageUrl: string | null;
  thumbnailUrl: string | null;
}

interface SlideItem {
  imagePath: string | null;
  selectedImages: SlideSelectedImage[];
  [key: string]: unknown;
}

interface ProjectData {
  version: number;
  workspaceDir: string;
  slidesWork: { slides: SlideItem[]; [key: string]: unknown };
  [key: string]: unknown;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function shortHash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 10);
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'img';
}

function extensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith('.png')) return '.png';
    if (pathname.endsWith('.webp')) return '.webp';
    if (pathname.endsWith('.svg')) return '.svg';
  } catch { /* ignore */ }
  return '.jpg';
}

/**
 * Download images that exist only as URLs (no local file) so they can be
 * included in the ZIP archive.  Mutates `imagePath` on matching entries.
 */
async function downloadMissingImages(project: ProjectData): Promise<void> {
  const imagesDir = path.join(project.workspaceDir, 'images');
  await fs.mkdir(imagesDir, { recursive: true });

  const { fetch } = await import('undici');

  for (const slide of project.slidesWork.slides ?? []) {
    const targets: Array<{ entry: SlideSelectedImage | SlideItem; url: string; label: string }> = [];

    // Primary imagePath missing but has a URL source in selectedImages[0]
    if (!slide.imagePath && slide.selectedImages?.length > 0) {
      const first = slide.selectedImages[0];
      const url = first.imageUrl ?? first.thumbnailUrl;
      if (url) targets.push({ entry: slide, url, label: String((slide as any).title ?? 'slide') });
    }

    for (const sel of slide.selectedImages ?? []) {
      if (sel.imagePath) continue; // already has a local file
      const url = sel.imageUrl ?? sel.thumbnailUrl;
      if (!url) continue;
      targets.push({ entry: sel, url, label: sel.imageQuery ?? sel.id });
    }

    for (const { entry, url, label } of targets) {
      const ext = extensionFromUrl(url);
      const dest = path.join(imagesDir, `save-${slugify(label)}-${shortHash(url)}${ext}`);
      try {
        // Skip if already downloaded in a previous save
        try { await fs.access(dest); entry.imagePath = dest; continue; } catch { /* not cached */ }

        const res = await fetch(url, {
          signal: AbortSignal.timeout(15_000),
          headers: { 'User-Agent': 'PPTX Slide Agent/1.0 (save-image)' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(dest, buf);
        entry.imagePath = dest;
        // Also sync slide.imagePath if it was the primary
        if (entry !== slide && slide.selectedImages?.[0] === entry && !slide.imagePath) {
          slide.imagePath = dest;
        }
      } catch (err) {
        console.warn(`[project-zip] Failed to download image for save: ${url}`, err);
      }
    }
  }
}

/** Collect every unique absolute image path referenced in the project. */
function collectImagePaths(project: ProjectData): Map<string, string> {
  const mapping = new Map<string, string>(); // absolute → relative
  for (const slide of project.slidesWork.slides ?? []) {
    if (slide.imagePath) {
      const basename = path.basename(slide.imagePath);
      mapping.set(slide.imagePath, `images/${basename}`);
    }
    for (const sel of slide.selectedImages ?? []) {
      if (sel.imagePath) {
        const basename = path.basename(sel.imagePath);
        mapping.set(sel.imagePath, `images/${basename}`);
      }
    }
  }
  return mapping;
}

/** Replace absolute imagePath values in project data with relative ZIP paths. */
function rewritePathsToRelative(
  project: ProjectData,
  mapping: Map<string, string>,
): ProjectData {
  const clone = structuredClone(project) as ProjectData;
  // Keep the version from the source project (do not override).
  for (const slide of clone.slidesWork.slides ?? []) {
    if (slide.imagePath && mapping.has(slide.imagePath)) {
      slide.imagePath = mapping.get(slide.imagePath)!;
    }
    for (const sel of slide.selectedImages ?? []) {
      if (sel.imagePath && mapping.has(sel.imagePath)) {
        sel.imagePath = mapping.get(sel.imagePath)!;
      }
    }
  }
  return clone;
}

/** Replace relative ZIP paths back to absolute workspace paths after extraction. */
function rewritePathsToAbsolute(
  project: ProjectData,
  workspaceDir: string,
): ProjectData {
  for (const slide of project.slidesWork.slides ?? []) {
    if (slide.imagePath && !path.isAbsolute(slide.imagePath as string)) {
      const basename = path.basename(slide.imagePath as string);
      slide.imagePath = path.join(workspaceDir, 'images', basename);
    }
    for (const sel of slide.selectedImages ?? []) {
      if (sel.imagePath && !path.isAbsolute(sel.imagePath)) {
        const basename = path.basename(sel.imagePath);
        sel.imagePath = path.join(workspaceDir, 'images', basename);
      }
    }
  }
  return project;
}

// ── Save ─────────────────────────────────────────────────────────────────────

export async function saveProjectAsZip(
  project: ProjectData,
  filePath: string,
): Promise<void> {
  // Download any URL-only images so they get included in the archive
  await downloadMissingImages(project);

  const imageMapping = collectImagePaths(project);
  const manifest = rewritePathsToRelative(project, imageMapping);

  const output = fss.createWriteStream(filePath);
  const archive = archiver('zip', { zlib: { level: 6 } });

  const done = new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });

  archive.pipe(output);

  // 1. manifest.json
  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

  // 2. images/
  for (const [absPath, relPath] of imageMapping) {
    try {
      await fs.access(absPath);
      archive.file(absPath, { name: relPath });
    } catch {
      console.warn(`[project-zip] Image file not found, skipping: ${absPath}`);
    }
  }

  // 3. previews/ — collect from workspace previews dir
  const workspaceDir = project.workspaceDir;
  if (workspaceDir) {
    const previewsDir = path.join(workspaceDir, 'previews');
    try {
      const entries = await fs.readdir(previewsDir);
      for (const entry of entries) {
        if (/\.(png|jpg|jpeg|webp|py|pptx)$/i.test(entry)) {
          const absPreview = path.join(previewsDir, entry);
          archive.file(absPreview, { name: `previews/${entry}` });
        }
      }
    } catch {
      // No previews directory — skip
    }
  }

  await archive.finalize();
  await done;
}

// ── Load ─────────────────────────────────────────────────────────────────────

export async function loadProjectFromZip(
  filePath: string,
  workspaceDir: string,
): Promise<ProjectData> {
  const zip = new AdmZip(filePath);

  // 1. Read manifest
  const manifestEntry = zip.getEntry('manifest.json');
  if (!manifestEntry) {
    throw new Error('Invalid .pptapp file: missing manifest.json');
  }
  const manifestJson = manifestEntry.getData().toString('utf-8');
  const project = JSON.parse(manifestJson) as ProjectData;

  // 2. Extract images/
  const imagesDir = path.join(workspaceDir, 'images');
  await fs.mkdir(imagesDir, { recursive: true });

  for (const entry of zip.getEntries()) {
    if (entry.entryName.startsWith('images/') && !entry.isDirectory) {
      const targetPath = path.join(workspaceDir, entry.entryName);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, entry.getData());
    }
  }

  // 3. Extract previews/
  const previewsDir = path.join(workspaceDir, 'previews');
  await fs.mkdir(previewsDir, { recursive: true });

  for (const entry of zip.getEntries()) {
    if (entry.entryName.startsWith('previews/') && !entry.isDirectory) {
      const basename = path.basename(entry.entryName);
      const targetPath = path.join(previewsDir, basename);
      await fs.writeFile(targetPath, entry.getData());
    }
  }

  // 4. Rewrite relative paths back to absolute
  project.workspaceDir = workspaceDir;
  rewritePathsToAbsolute(project, workspaceDir);

  return project;
}
