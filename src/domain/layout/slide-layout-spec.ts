import type { SlideItem } from '../entities/slide-work'

export interface RectSpec {
  x: number
  y: number
  w: number
  h: number
}

export interface SlideLayoutSpec {
  titleRect?: RectSpec
  keyMessageRect?: RectSpec
  accentRect?: RectSpec
  subtitleRect?: RectSpec
  iconRect?: RectSpec
  contentRect?: RectSpec
  notesRect?: RectSpec
  maxItems: number
  rowStep?: number
  timeline?: {
    lineX: number
    lineY: number
    lineH: number
    dotX: number
    dotSize: number
    startY: number
    stepY: number
    textX: number
    textW: number
  }
  cards?: {
    columns: number
    cardW: number
    cardH: number
    startX: number
    startY: number
    gapX: number
    gapY: number
  }
  stats?: {
    startX: number
    startY: number
    boxW: number
    boxH: number
    gapX: number
  }
  comparison?: {
    left: RectSpec
    right: RectSpec
  }
  summaryBox?: RectSpec
}

export const SLIDE_WIDTH_IN = 13.33
export const SLIDE_HEIGHT_IN = 7.5
export const CONTENT_LEFT_IN = 0.5
export const CONTENT_RIGHT_IN = 0.5
export const CONTENT_WIDTH_IN = SLIDE_WIDTH_IN - CONTENT_LEFT_IN - CONTENT_RIGHT_IN
export const HEADER_WIDTH_RATIO = 0.86
export const ICON_CORNER_MARGIN_X = 0.5
export const ICON_CORNER_MARGIN_Y = 0.45

export function toPreviewPx(valueInches: number, scale: number): number {
  return valueInches * 96 * scale
}

function headerRect(x: number, y: number, w: number, h: number, ratio = HEADER_WIDTH_RATIO): RectSpec {
  const headerW = Number((w * ratio).toFixed(2))
  const headerX = Number((x + (w - headerW) / 2).toFixed(2))
  return { x: headerX, y, w: headerW, h }
}

function iconCornerRect(size: number, corner: 'left' | 'right' = 'right', top = ICON_CORNER_MARGIN_Y): RectSpec {
  const x = corner === 'left'
    ? ICON_CORNER_MARGIN_X
    : Number((SLIDE_WIDTH_IN - ICON_CORNER_MARGIN_X - size).toFixed(2))
  return { x, y: top, w: size, h: size }
}

export function getVisibleBullets(slide: SlideItem): string[] {
  return slide.bullets.slice(0, getSlideLayoutSpec(slide).maxItems)
}

export function splitComparisonBullets(slide: SlideItem): [string[], string[]] {
  const items = getVisibleBullets(slide)
  const half = Math.ceil(items.length / 2)
  return [items.slice(0, half), items.slice(half)]
}

export function getSlideLayoutSpec(slide: SlideItem): SlideLayoutSpec {
  switch (slide.layout) {
    case 'title':
      return {
        titleRect: headerRect(0.5, 1.45, 7.9, 0.6),
        keyMessageRect: headerRect(0.5, 2.16, 7.3, 0.46),
        accentRect: { x: 0.5, y: 1.08, w: 0.9, h: 0.06 },
        iconRect: iconCornerRect(2.35),
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 0,
      }
    case 'section':
      return {
        titleRect: headerRect(0.9, 2.1, 8.4, 0.48),
        keyMessageRect: headerRect(0.9, 2.58, 8.9, 0.68),
        accentRect: { x: 0.9, y: 1.68, w: 0.9, h: 0.05 },
        iconRect: iconCornerRect(1.6),
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 0,
      }
    case 'agenda':
      return {
        titleRect: headerRect(0.5, 0.5, 9.1, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, 9.1, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        contentRect: { x: 0.5, y: 1.86, w: 8.8, h: 3.36 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 5,
        rowStep: 0.58,
      }
    case 'cards':
      return {
        titleRect: headerRect(0.5, 0.5, 12.33, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, 12.33, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        iconRect: slide.icon ? iconCornerRect(2.1) : undefined,
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 4,
        cards: {
          columns: 2,
          cardW: 5.9,
          cardH: 1.04,
          startX: 0.5,
          startY: 1.86,
          gapX: 0.32,
          gapY: 0.28,
        },
      }
    case 'stats':
      return {
        titleRect: headerRect(0.5, 0.5, 12.33, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, 12.33, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        iconRect: slide.icon ? iconCornerRect(2.1) : undefined,
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 3,
        stats: {
          startX: 0.5,
          startY: 1.95,
          boxW: 3.7,
          boxH: 1.85,
          gapX: 0.35,
        },
      }
    case 'comparison':
      return {
        titleRect: headerRect(0.5, 0.5, 12.33, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, 12.33, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        iconRect: slide.icon ? iconCornerRect(2.1) : undefined,
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 6,
        comparison: {
          left: { x: 0.5, y: 1.95, w: 5.7, h: 3.1 },
          right: { x: 6.65, y: 1.95, w: 5.7, h: 3.1 },
        },
      }
    case 'timeline':
      return {
        titleRect: headerRect(0.5, 0.5, 12.33, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, 12.33, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        iconRect: slide.icon ? iconCornerRect(2.1) : undefined,
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 5,
        timeline: {
          lineX: 1.1,
          lineY: 1.86,
          lineH: 3.34,
          dotX: 0.98,
          dotSize: 0.24,
          startY: 1.82,
          stepY: 0.62,
          textX: 1.45,
          textW: 10.8,
        },
      }
    case 'summary':
      return {
        titleRect: headerRect(0.5, 0.5, 12.33, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, 12.33, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        iconRect: slide.icon ? iconCornerRect(2.1) : undefined,
        summaryBox: { x: 0.5, y: 1.86, w: 12.33, h: 0.95 },
        contentRect: { x: 0.5, y: 3.1, w: 12.33, h: 2.0 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 3,
      }
    case 'diagram':
      return {
        titleRect: headerRect(0.5, 0.5, 9.1, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, 9.1, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        iconRect: iconCornerRect(1.8),
        contentRect: { x: 0.5, y: 1.86, w: 8.9, h: 3.3 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 5,
      }
    case 'bullets':
    default:
      return {
        titleRect: headerRect(0.5, 0.5, slide.icon ? 9.1 : 12.33, 0.50),
        keyMessageRect: headerRect(0.5, 1.02, slide.icon ? 9.1 : 12.33, 0.55),
        accentRect: { x: 0.5, y: 1.62, w: 1.5, h: 0.04 },
        iconRect: slide.icon ? iconCornerRect(2.1) : undefined,
        contentRect: { x: 0.5, y: 1.86, w: slide.icon ? 9.3 : 12.33, h: 3.8 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 6,
      }
  }
}