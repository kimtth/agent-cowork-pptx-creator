/**
 * IPC Handler: PPTX Generation
 * Ported from ref/copilot-sdk-pptx-agent/src/app/api/skills/pptx/route.ts
 * Executes AI-generated PptxGenJS code in a controlled scope.
 */

import { ipcMain, dialog, app, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import PptxGenJS from 'pptxgenjs';
import type { ThemeTokens } from '../../src/domain/entities/palette';
import type { GeneratedSlidePreview, GeneratedSlidePreviewObject, SlideItem } from '../../src/domain/entities/slide-work';
import { CONTENT_WIDTH_IN, CONTENT_LEFT_IN, getSlideLayoutSpec, getVisibleBullets, splitComparisonBullets } from '../../src/domain/layout/slide-layout-spec';
import { buildIconifySvgUrl, normalizeIconName } from '../../src/domain/icons/iconify';

const defaultC = {
  DARK: '1B1B1B',
  DARK2: '2D2D2D',
  LIGHT: 'FFFFFF',
  LIGHT2: 'F5F5F5',
  ACCENT1: '0078D4',
  ACCENT2: '005A9E',
  ACCENT3: '107C10',
  ACCENT4: '5C2D91',
  ACCENT5: '008272',
  ACCENT6: 'D83B01',
  LINK: '0078D4',
  USED_LINK: '5C2D91',
  PRIMARY: '0078D4',
  SECONDARY: '5C2D91',
  BG: 'FFFFFF',
  TEXT: '1B1B1B',
  WHITE: 'FFFFFF',
  BORDER: 'E1E1E1',
};

const F = { EN: 'Segoe UI', JA: 'Noto Sans JP' };
const SW = 13.33;
const SH = 7.5;
const ML = CONTENT_LEFT_IN;
const MR = 0.5;
const CW = CONTENT_WIDTH_IN;
const HEADER_H = 0.45;

function getAccentSequence(C: ThemeTokens['C']): string[] {
  return [C.ACCENT1, C.ACCENT2, C.ACCENT3, C.ACCENT4, C.ACCENT5, C.ACCENT6]
}

function getSlideAccentIndex(slideItem: SlideItem): number {
  const mapped = {
    blue: 0,
    green: 2,
    purple: 3,
    teal: 4,
    orange: 5,
  } as const
  return mapped[slideItem.accent] ?? 0
}

function getSlideTones(slideItem: SlideItem, C: ThemeTokens['C']) {
  const accents = getAccentSequence(C)
  const baseIndex = getSlideAccentIndex(slideItem) % accents.length
  return {
    primary: accents[baseIndex],
    secondary: accents[(baseIndex + 1) % accents.length],
    tertiary: accents[(baseIndex + 2) % accents.length],
    quaternary: accents[(baseIndex + 3) % accents.length],
    accents,
  }
}

async function ensureIconifyAsset(name: string, color: string): Promise<string> {
  const normalized = normalizeIconName(name)
  if (!normalized) throw new Error(`Invalid icon name: ${name}`)

  const cacheDir = path.join(app.getPath('userData'), 'iconify-cache')
  await fs.mkdir(cacheDir, { recursive: true })
  const safeName = normalized.replace(/[:/\\]/g, '__')
  const filePath = path.join(cacheDir, `${safeName}.svg`)
  if (!existsSync(filePath)) {
    const { fetch } = await import('undici')
    const res = await fetch(buildIconifySvgUrl(normalized, color), {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'PPTX Slide Agent/1.0 (icon download)' },
    })
    if (!res.ok) throw new Error(`Unable to resolve icon asset: ${normalized}`)
    await fs.writeFile(filePath, Buffer.from(await res.arrayBuffer()))
  }
  return filePath
}

async function resolveIconHelpers(code: string | null, color: string) {
  const replacements = new Map<string, string>()

  if (code) {
    const matches = [...code.matchAll(/iconPath\(\s*['"`]([^'"`]+)['"`]\s*\)/g)]
    for (const match of matches) {
      const iconName = match[1]
      if (!replacements.has(iconName)) {
        replacements.set(iconName, await ensureIconifyAsset(iconName, color))
      }
    }
  }

  const fallback = await ensureIconifyAsset('mdi:file-document-outline', color)
  const iconPath = (name: string): string => replacements.get(name) ?? fallback
  return { iconPath, fallback }
}

async function savePresentationBuffer(buffer: ArrayBuffer, title: string, win: BrowserWindow | null) {
  const safeTitle = (title || 'presentation').replace(/[^\w\s\-]/g, '_');
  const dialogOptions = {
    title: 'Save Presentation',
    defaultPath: `${safeTitle}.pptx`,
    filters: [{ name: 'PowerPoint', extensions: ['pptx'] }],
  };
  const { filePath, canceled } = win
    ? await dialog.showSaveDialog(win, dialogOptions)
    : await dialog.showSaveDialog(dialogOptions);

  if (canceled || !filePath) {
    return { success: false, error: 'Cancelled' };
  }

  await fs.writeFile(filePath, Buffer.from(buffer));
  return { success: true, path: filePath };
}

function addSlideMaster(pres: PptxGenJS, title: string, C: ThemeTokens['C']) {
  pres.defineSlideMaster({
    title: 'CONTENT',
    background: { color: C.LIGHT },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: HEADER_H, fill: { color: C.ACCENT1 } } },
      { rect: { x: 0, y: 0, w: 0.06, h: HEADER_H, fill: { color: C.ACCENT2 } } },
      { text: { text: title, options: { x: 0.3, y: 0.08, w: 10.6, h: 0.3, fontSize: 9, fontFace: F.EN, color: C.LIGHT } } },
      { rect: { x: ML, y: SH - 0.35, w: CW, h: 0.005, fill: { color: C.BORDER } } },
    ],
    slideNumber: { x: SW - 1.2, y: SH - 0.33, w: 0.8, h: 0.28, fontSize: 7.5, fontFace: F.EN, color: C.DARK2, align: 'right' },
  });
}

function addNotesPanel(slide: PptxGenJS.Slide, notes: string, C: ThemeTokens['C']) {
  if (!notes) return;
  const spec = { x: 0.5, y: 6.18, w: 12.33, h: 0.7 };
  slide.addNotes(notes);
  slide.addShape('roundRect', {
    x: spec.x,
    y: spec.y,
    w: spec.w,
    h: spec.h,
    rectRadius: 0.04,
    fill: { color: C.LIGHT2 },
    line: { color: C.BORDER, width: 1 },
  });
  slide.addText(notes, {
    x: spec.x + 0.18,
    y: spec.y + 0.12,
    w: spec.w - 0.36,
    h: 0.42,
    fontSize: 9.5,
    color: C.DARK2,
    fontFace: F.JA,
    fit: 'shrink',
    margin: 0,
  });
}

function addHeroVisual(slide: PptxGenJS.Slide, slideItem: SlideItem, C: ThemeTokens['C'], iconPath: (name: string) => string, x = 10, y = 1, size = 2.1) {
  const imageSource = slideItem.imagePath && existsSync(slideItem.imagePath) ? slideItem.imagePath : null
  if (!imageSource && !slideItem.icon) return;
  slide.addShape('roundRect', {
    x,
    y,
    w: size,
    h: size,
    rectRadius: 0.08,
    fill: { color: C.LIGHT2 },
    line: { color: C.BORDER, width: 1 },
  });
  slide.addImage({ path: imageSource ?? iconPath(slideItem.icon!), x: x + 0.06, y: y + 0.06, w: size - 0.12, h: size - 0.12, sizing: imageSource ? { type: 'cover', x: x + 0.06, y: y + 0.06, w: size - 0.12, h: size - 0.12 } : undefined });
}

function addTitleBlock(slide: PptxGenJS.Slide, slideItem: SlideItem, C: ThemeTokens['C'], width = 9.2) {
  const spec = getSlideLayoutSpec(slideItem)
  const tones = getSlideTones(slideItem, C)
  const titleRect = spec.titleRect ?? { x: ML, y: 0.72, w: width, h: 0.34 }
  const keyRect = spec.keyMessageRect ?? { x: ML, y: 1.08, w: width, h: 0.52 }
  const accentRect = spec.accentRect ?? { x: ML, y: 1.68, w: 1.5, h: 0.04 }
  slide.addText(slideItem.title, {
    x: titleRect.x,
    y: titleRect.y,
    w: titleRect.w,
    h: titleRect.h,
    fontSize: 18,
    bold: true,
    color: C.TEXT,
    fontFace: F.JA,
    fit: 'shrink',
  });
  if (slideItem.keyMessage) {
    slide.addText(slideItem.keyMessage, {
      x: keyRect.x,
      y: keyRect.y,
      w: keyRect.w,
      h: keyRect.h,
      fontSize: 24,
      bold: true,
      color: tones.secondary,
      fontFace: F.JA,
      fit: 'shrink',
    });
  }
  slide.addShape('rect', {
    x: accentRect.x,
    y: accentRect.y,
    w: accentRect.w,
    h: accentRect.h,
    fill: { color: tones.primary },
    line: { color: tones.primary, transparency: 100 },
  });
}

function addBulletRows(slide: PptxGenJS.Slide, bullets: string[], C: ThemeTokens['C'], x: number, y: number, w: number, maxItems: number, fontSize = 15) {
  const items = bullets.slice(0, maxItems).map((bullet) => ({
    text: bullet,
    options: { bullet: { indent: 14 }, breakLine: true },
  }));
  if (items.length === 0) return;
  slide.addText(items, {
    x,
    y,
    w,
    h: 3.6,
    fontSize,
    color: C.TEXT,
    fontFace: F.JA,
    fit: 'shrink',
    paraSpaceAfter: 8,
    valign: 'top',
  });
}

function addOutlineSlide(pres: PptxGenJS, slideItem: SlideItem, C: ThemeTokens['C'], iconPath: (name: string) => string) {
  const slide = pres.addSlide({ masterName: 'CONTENT' });
  slide.background = { color: C.BG };
  const spec = getSlideLayoutSpec(slideItem)
  const tones = getSlideTones(slideItem, C)

  if (slideItem.layout === 'title') {
    const titleRect = spec.titleRect!
    const keyRect = spec.keyMessageRect!
    const accentRect = spec.accentRect!
    slide.addText(slideItem.title, {
      x: titleRect.x,
      y: titleRect.y,
      w: titleRect.w,
      h: titleRect.h,
      fontSize: 30,
      bold: true,
      color: C.TEXT,
      fontFace: F.JA,
      fit: 'shrink',
    });
    if (slideItem.keyMessage) {
      slide.addText(slideItem.keyMessage, {
        x: keyRect.x,
        y: keyRect.y,
        w: keyRect.w,
        h: keyRect.h,
        fontSize: 16,
        color: tones.secondary,
        fontFace: F.JA,
        fit: 'shrink',
      });
    }
    slide.addShape('rect', {
      x: accentRect.x,
      y: accentRect.y,
      w: accentRect.w,
      h: accentRect.h,
      fill: { color: tones.primary },
      line: { color: tones.primary, transparency: 100 },
    });
    if (spec.iconRect) addHeroVisual(slide, slideItem, C, iconPath, spec.iconRect.x, spec.iconRect.y, spec.iconRect.w);
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (slideItem.layout === 'section') {
    const titleRect = spec.titleRect!
    const keyRect = spec.keyMessageRect!
    const accentRect = spec.accentRect!
    slide.background = { color: tones.primary };
    slide.addText(slideItem.title, {
      x: titleRect.x,
      y: titleRect.y,
      w: titleRect.w,
      h: titleRect.h,
      fontSize: 18,
      bold: true,
      color: C.LIGHT,
      fontFace: F.JA,
      fit: 'shrink',
    });
    slide.addText(slideItem.keyMessage || slideItem.title, {
      x: keyRect.x,
      y: keyRect.y,
      w: keyRect.w,
      h: keyRect.h,
      fontSize: 28,
      bold: true,
      color: C.LIGHT,
      fontFace: F.JA,
      fit: 'shrink',
    });
    slide.addShape('rect', {
      x: accentRect.x,
      y: accentRect.y,
      w: accentRect.w,
      h: accentRect.h,
      fill: { color: C.LIGHT },
      line: { color: C.LIGHT, transparency: 100 },
    });
    if (slideItem.icon && spec.iconRect) {
      slide.addImage({ path: slideItem.imagePath && existsSync(slideItem.imagePath) ? slideItem.imagePath : iconPath(slideItem.icon), x: spec.iconRect.x, y: spec.iconRect.y, w: spec.iconRect.w, h: spec.iconRect.h, transparency: 8, sizing: slideItem.imagePath ? { type: 'cover', x: spec.iconRect.x, y: spec.iconRect.y, w: spec.iconRect.w, h: spec.iconRect.h } : undefined });
    }
    addNotesPanel(slide, slideItem.notes, { ...C, LIGHT2: 'DDE7F7', BORDER: '9DB5D6' });
    return;
  }

  addTitleBlock(slide, slideItem, C, slideItem.icon ? (spec.titleRect?.w ?? 9.1) : CW);

  if (slideItem.layout === 'agenda') {
    const items = getVisibleBullets(slideItem)
    const contentRect = spec.contentRect!
    items.forEach((bullet, index) => {
      const rowY = contentRect.y + index * (spec.rowStep ?? 0.58);
      slide.addShape('roundRect', {
        x: contentRect.x,
        y: rowY,
        w: 0.34,
        h: 0.34,
        rectRadius: 0.03,
        fill: { color: C.ACCENT1 },
        line: { color: C.ACCENT1, transparency: 100 },
      });
      slide.addText(String(index + 1), { x: contentRect.x, y: rowY + 0.03, w: 0.34, h: 0.2, fontSize: 9, bold: true, color: C.LIGHT, align: 'center' });
      slide.addText(bullet, { x: contentRect.x + 0.5, y: rowY - 0.01, w: contentRect.w, h: 0.28, fontSize: 16, color: C.TEXT, fontFace: F.JA, fit: 'shrink' });
    });
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (slideItem.layout === 'cards') {
    const items = getVisibleBullets(slideItem);
    const grid = spec.cards!;
    const cols = Math.min(items.length, grid.columns) || 1;
    items.forEach((bullet, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const cardW = cols === 1 ? CONTENT_WIDTH_IN - 0.53 : grid.cardW;
      const x = grid.startX + col * (cardW + grid.gapX);
      const y = grid.startY + row * (grid.cardH + grid.gapY);
      slide.addShape('roundRect', {
        x, y, w: cardW, h: 1.04,
        rectRadius: 0.05,
        fill: { color: C.LIGHT2 },
        line: { color: C.BORDER, width: 1 },
      });
      const tone = tones.accents[index % tones.accents.length]
      slide.addShape('rect', {
        x, y, w: cardW, h: 0.05,
        fill: { color: tone },
        line: { color: tone, transparency: 100 },
      });
      slide.addText(bullet, { x: x + 0.18, y: y + 0.18, w: cardW - 0.36, h: 0.62, fontSize: 14, color: C.TEXT, fontFace: F.JA, fit: 'shrink', valign: 'middle' });
    });
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (slideItem.layout === 'stats') {
    const statItems = getVisibleBullets(slideItem)
    const stats = spec.stats!
    statItems.forEach((bullet, index) => {
      const [value, ...rest] = bullet.split(/[:：]/);
      const x = stats.startX + index * (stats.boxW + stats.gapX);
      const tone = tones.accents[index % tones.accents.length]
      slide.addShape('roundRect', {
        x, y: stats.startY, w: stats.boxW, h: stats.boxH,
        rectRadius: 0.06,
        fill: { color: C.LIGHT2 },
        line: { color: tone, width: 1.5 },
      });
      slide.addText(value.trim(), { x, y: stats.startY + 0.3, w: stats.boxW, h: 0.5, fontSize: 24, bold: true, color: tone, align: 'center', fontFace: F.EN, fit: 'shrink' });
      slide.addText((rest.join(':') || bullet).trim(), { x: x + 0.16, y: stats.startY + 0.95, w: stats.boxW - 0.32, h: 0.42, fontSize: 11, color: C.DARK2, align: 'center', fontFace: F.JA, fit: 'shrink' });
    });
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (slideItem.layout === 'comparison') {
    const [leftItems, rightItems] = splitComparisonBullets(slideItem)
    const comparison = spec.comparison!
    ;[
      { group: leftItems, rect: comparison.left, tone: tones.primary },
      { group: rightItems, rect: comparison.right, tone: tones.secondary },
    ].forEach(({ group, rect, tone }) => {
      slide.addShape('rect', { x: rect.x, y: rect.y - 0.24, w: rect.w, h: 0.05, fill: { color: tone }, line: { color: tone, transparency: 100 } });
      addBulletRows(slide, group, C, rect.x, rect.y, rect.w, 3, 14);
    });
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (slideItem.layout === 'timeline') {
    const timeline = spec.timeline!
    slide.addShape('line', { x: timeline.lineX, y: timeline.lineY, w: 0, h: timeline.lineH, line: { color: C.BORDER, width: 2 } });
    getVisibleBullets(slideItem).forEach((bullet, index) => {
      const y = timeline.startY + index * timeline.stepY;
      const tone = tones.accents[index % tones.accents.length]
      slide.addShape('ellipse', {
        x: timeline.dotX, y, w: timeline.dotSize, h: timeline.dotSize,
        fill: { color: tone },
        line: { color: tone, width: 1 },
      });
      slide.addText(bullet, { x: timeline.textX, y: y - 0.03, w: timeline.textW, h: 0.28, fontSize: 14, color: C.TEXT, fontFace: F.JA, fit: 'shrink' });
    });
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (slideItem.layout === 'summary') {
    const summaryBox = spec.summaryBox!
    const contentRect = spec.contentRect!
    slide.addShape('roundRect', {
      x: summaryBox.x, y: summaryBox.y, w: summaryBox.w, h: summaryBox.h,
      rectRadius: 0.05,
      fill: { color: C.LIGHT2 },
      line: { color: tones.primary, width: 1 },
    });
    slide.addText('Key Message', { x: summaryBox.x + 0.18, y: summaryBox.y + 0.13, w: 1.6, h: 0.2, fontSize: 10, bold: true, color: tones.primary, fontFace: F.EN });
    slide.addText(slideItem.keyMessage || slideItem.title, { x: summaryBox.x + 0.18, y: summaryBox.y + 0.36, w: summaryBox.w - 0.36, h: 0.34, fontSize: 14, color: C.TEXT, fontFace: F.JA, fit: 'shrink' });
    addBulletRows(slide, getVisibleBullets(slideItem), C, contentRect.x, contentRect.y, contentRect.w, 3, 14);
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (slideItem.layout === 'diagram') {
    if (spec.iconRect) addHeroVisual(slide, slideItem, C, iconPath, spec.iconRect.x, spec.iconRect.y, spec.iconRect.w);
    if (spec.contentRect) addBulletRows(slide, getVisibleBullets(slideItem), C, spec.contentRect.x, spec.contentRect.y, spec.contentRect.w, spec.maxItems, 14);
    addNotesPanel(slide, slideItem.notes, C);
    return;
  }

  if (spec.iconRect) addHeroVisual(slide, slideItem, C, iconPath, spec.iconRect.x, spec.iconRect.y, spec.iconRect.w);
  if (spec.contentRect) addBulletRows(slide, getVisibleBullets(slideItem), C, spec.contentRect.x, spec.contentRect.y, spec.contentRect.w, spec.maxItems, 15);
  addNotesPanel(slide, slideItem.notes, C);
}

async function exportSlidesToBuffer(slides: SlideItem[], theme: ThemeTokens | null, title: string): Promise<ArrayBuffer> {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.author = 'PPTX Slide Agent';
  pres.subject = title || 'Presentation';
  pres.title = title || 'Presentation';
  const C = theme ? theme.C : defaultC;
  const { iconPath } = await resolveIconHelpers(null, C.DARK2);

  addSlideMaster(pres, title || 'Presentation', C);
  slides.forEach((slideItem) => addOutlineSlide(pres, slideItem, C, iconPath));

  return pres.write({ outputType: 'arraybuffer' }) as Promise<ArrayBuffer>;
}

function normalizePreviewColor(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  return value.replace('#', '').toUpperCase();
}

function normalizePreviewLength(value: unknown, axis: 'x' | 'y', slide: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) {
      const numeric = Number.parseFloat(trimmed.slice(0, -1));
      const total = axis === 'x'
        ? (slide?._presLayout?.width ?? slide?._presLayout?._sizeW ?? SW)
        : (slide?._presLayout?.height ?? slide?._presLayout?._sizeH ?? SH);
      return Number.isFinite(numeric) ? (numeric / 100) * total : 0;
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return numeric;
  }

  return 0;
}

function extractTextContent(text: unknown): string | null {
  if (typeof text === 'string') return text;
  if (!Array.isArray(text)) return null;
  return text
    .map((part) => (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim() || null;
}

// ---------------------------------------------------------------------------
// PptxGenJS code execution
// ---------------------------------------------------------------------------

async function buildPresentationFromCode(code: string, theme: ThemeTokens | null): Promise<PptxGenJS> {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  const C = theme ? theme.C : defaultC;
  const { iconPath, fallback } = await resolveIconHelpers(code, C.DARK2);
  const resolvedCode = code.replace(/iconPath\(\s*['"`]([^'"`]+)['"`]\s*\)/g, (_match, iconName) => JSON.stringify(iconPath(iconName)));

  const fn = new Function(
    'pres', 'C', 'F', 'SW', 'SH', 'ML', 'MR', 'CW', 'HEADER_H', 'ICON_DIR', 'iconPath',
    `return (async () => { ${resolvedCode} })();`,
  );

  await fn(pres, C, F, SW, SH, ML, MR, CW, HEADER_H, path.dirname(fallback), iconPath);

  return pres;
}

function mimeTypeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.bmp':
      return 'image/bmp';
    default:
      return 'application/octet-stream';
  }
}

async function imageValueToDataUrl(value: unknown): Promise<string | null> {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  if (value.startsWith('data:')) return value;
  if (/^https?:/i.test(value)) return value;

  const normalizedPath = value.replace(/^file:\/\//i, '');
  const filePath = path.isAbsolute(normalizedPath) ? normalizedPath : value;
  if (!existsSync(filePath)) return null;

  const data = await fs.readFile(filePath);
  return `data:${mimeTypeForPath(filePath)};base64,${data.toString('base64')}`;
}

function deriveSlideTitleFromObjects(objects: GeneratedSlidePreviewObject[], fallbackNumber: number): string {
  const textObjects = objects
    .filter((object) => object.kind === 'text' && object.text)
    .sort((left, right) => {
      if (left.y === right.y) return (right.fontSize ?? 0) - (left.fontSize ?? 0);
      return left.y - right.y;
    });

  return textObjects[0]?.text?.replace(/\s+/g, ' ').trim() || `Generated Slide ${fallbackNumber}`;
}

async function mapSlideObjectForPreview(object: any, slide: any): Promise<GeneratedSlidePreviewObject | null> {
  const options = object?.options ?? {};
  const x = normalizePreviewLength(options.x, 'x', slide);
  const y = normalizePreviewLength(options.y, 'y', slide);
  const w = normalizePreviewLength(options.w, 'x', slide);
  const h = normalizePreviewLength(options.h, 'y', slide);

  if (object?._type === 'notes') return null;

  if (object?._type === 'image') {
    return {
      kind: 'image',
      x,
      y,
      w,
      h,
      path: typeof object.image === 'string' ? object.image : null,
      data: await imageValueToDataUrl(object.image),
      rotate: typeof options.rotate === 'number' ? options.rotate : null,
      transparency: typeof options.transparency === 'number' ? options.transparency : null,
    };
  }

  const hasText = object?._type === 'text' && extractTextContent(object?.text);
  const shape = typeof object?.shape === 'string' ? object.shape : null;
  const fillColor = normalizePreviewColor(options?.fill?.color);
  const lineColor = normalizePreviewColor(options?.line?.color);
  const lineWidth = typeof options?.line?.width === 'number' ? options.line.width : null;

  if (hasText) {
    return {
      kind: 'text',
      shape,
      x,
      y,
      w,
      h,
      text: extractTextContent(object.text),
      fontSize: typeof options.fontSize === 'number' ? options.fontSize : null,
      color: normalizePreviewColor(options.color),
      fillColor,
      lineColor,
      lineWidth,
      rotate: typeof options.rotate === 'number' ? options.rotate : null,
      transparency: typeof options.transparency === 'number' ? options.transparency : null,
      align: typeof options.align === 'string' ? options.align : null,
      valign: typeof options.valign === 'string' ? options.valign : options?._bodyProp?.anchor ?? null,
    };
  }

  return {
    kind: 'shape',
    shape,
    x,
    y,
    w,
    h,
    fillColor,
    lineColor,
    lineWidth,
    rotate: typeof options.rotate === 'number' ? options.rotate : null,
    transparency: typeof options.transparency === 'number' ? options.transparency : null,
  };
}

async function serializePresentationForPreview(pres: PptxGenJS): Promise<GeneratedSlidePreview[]> {
  const slides = (pres as any).slides as Array<any>;
  return Promise.all(slides.map(async (slide, index) => {
    const layoutObjects = (slide?._slideLayout?._slideObjects ?? []) as Array<any>;
    const slideObjects = (slide?._slideObjects ?? []) as Array<any>;
    const objects = (await Promise.all(
      [...layoutObjects, ...slideObjects].map((object) => mapSlideObjectForPreview(object, slide)),
    )).filter((object): object is GeneratedSlidePreviewObject => object !== null);
    const notesObject = slideObjects.find((object: any) => object?._type === 'notes');
    const background = slide?.background ?? slide?._slideLayout?.background ?? null;

    return {
      id: `generated-${index + 1}`,
      number: index + 1,
      title: deriveSlideTitleFromObjects(objects, index + 1),
      backgroundColor: normalizePreviewColor(background?.color),
      backgroundImageData: await imageValueToDataUrl(background?.path ?? background?.data ?? background?.src),
      notes: extractTextContent(notesObject?.text),
      objects,
    };
  }));
}
async function executePptxCode(code: string, theme: ThemeTokens | null): Promise<ArrayBuffer> {
  const pres = await buildPresentationFromCode(code, theme);

  return pres.write({ outputType: 'arraybuffer' }) as Promise<ArrayBuffer>;
}

// ---------------------------------------------------------------------------
// Handler registration
// ---------------------------------------------------------------------------

export function registerPptxHandlers(): void {
  /** Execute PptxGenJS code, prompt save dialog, write file */
  ipcMain.handle('pptx:generate', async (_event, code: string, themeTokens: ThemeTokens | null, title: string) => {
    try {
      const win = BrowserWindow.fromWebContents(_event.sender);
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return { success: false, error: 'code must not be empty' };
      }

      const buffer = await executePptxCode(code, themeTokens);

      return savePresentationBuffer(buffer, title, win);
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to generate PPTX' };
    }
  });

  ipcMain.handle('pptx:exportSlides', async (_event, slides: SlideItem[], themeTokens: ThemeTokens | null, title: string) => {
    try {
      const win = BrowserWindow.fromWebContents(_event.sender);
      if (!Array.isArray(slides) || slides.length === 0) {
        return { success: false, error: 'slides must not be empty' };
      }

      const buffer = await exportSlidesToBuffer(slides, themeTokens, title);
      return savePresentationBuffer(buffer, title, win);
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to export slides' };
    }
  });

  /** Execute PptxGenJS code and return raw ArrayBuffer to renderer (for preview) */
  ipcMain.handle('pptx:executeCode', async (_event, code: string, themeTokens: ThemeTokens | null) => {
    return executePptxCode(code, themeTokens);
  });

  ipcMain.handle('pptx:inspectCode', async (_event, code: string, themeTokens: ThemeTokens | null) => {
    const pres = await buildPresentationFromCode(code, themeTokens);
    return serializePresentationForPreview(pres);
  });
}
