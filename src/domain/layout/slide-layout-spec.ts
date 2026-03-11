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

export function toPreviewPx(valueInches: number, scale: number): number {
  return valueInches * 96 * scale
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
        titleRect: { x: 0.5, y: 1.45, w: 7.9, h: 0.6 },
        keyMessageRect: { x: 0.5, y: 2.16, w: 7.3, h: 0.46 },
        accentRect: { x: 0.5, y: 1.08, w: 0.9, h: 0.06 },
        iconRect: { x: 9.5, y: 1.45, w: 2.35, h: 2.35 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 0,
      }
    case 'section':
      return {
        titleRect: { x: 0.9, y: 2.1, w: 8.4, h: 0.48 },
        keyMessageRect: { x: 0.9, y: 2.58, w: 8.9, h: 0.68 },
        accentRect: { x: 0.9, y: 1.68, w: 0.9, h: 0.05 },
        iconRect: { x: 10.1, y: 2.0, w: 1.6, h: 1.6 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 0,
      }
    case 'agenda':
      return {
        titleRect: { x: 0.5, y: 0.72, w: 9.1, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: 9.1, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        contentRect: { x: 0.5, y: 2.02, w: 8.8, h: 3.2 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 5,
        rowStep: 0.58,
      }
    case 'cards':
      return {
        titleRect: { x: 0.5, y: 0.72, w: 12.33, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: 12.33, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 4,
        cards: {
          columns: 2,
          cardW: 5.9,
          cardH: 1.04,
          startX: 0.5,
          startY: 2.0,
          gapX: 0.32,
          gapY: 0.28,
        },
      }
    case 'stats':
      return {
        titleRect: { x: 0.5, y: 0.72, w: 12.33, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: 12.33, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 3,
        stats: {
          startX: 0.5,
          startY: 2.15,
          boxW: 3.7,
          boxH: 1.85,
          gapX: 0.35,
        },
      }
    case 'comparison':
      return {
        titleRect: { x: 0.5, y: 0.72, w: 12.33, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: 12.33, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 6,
        comparison: {
          left: { x: 0.5, y: 2.24, w: 5.7, h: 2.8 },
          right: { x: 6.65, y: 2.24, w: 5.7, h: 2.8 },
        },
      }
    case 'timeline':
      return {
        titleRect: { x: 0.5, y: 0.72, w: 12.33, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: 12.33, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 5,
        timeline: {
          lineX: 1.1,
          lineY: 2.1,
          lineH: 3.1,
          dotX: 0.98,
          dotSize: 0.24,
          startY: 2.05,
          stepY: 0.62,
          textX: 1.45,
          textW: 10.8,
        },
      }
    case 'summary':
      return {
        titleRect: { x: 0.5, y: 0.72, w: 12.33, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: 12.33, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        summaryBox: { x: 0.5, y: 2.0, w: 12.33, h: 0.95 },
        contentRect: { x: 0.5, y: 3.25, w: 12.33, h: 1.8 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 3,
      }
    case 'diagram':
      return {
        titleRect: { x: 0.5, y: 0.72, w: 9.1, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: 9.1, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        iconRect: { x: 10.0, y: 2.3, w: 1.8, h: 1.8 },
        contentRect: { x: 0.5, y: 2.05, w: 8.9, h: 3.1 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 5,
      }
    case 'bullets':
    default:
      return {
        titleRect: { x: 0.5, y: 0.72, w: slide.icon ? 9.1 : 12.33, h: 0.34 },
        keyMessageRect: { x: 0.5, y: 1.08, w: slide.icon ? 9.1 : 12.33, h: 0.52 },
        accentRect: { x: 0.5, y: 1.68, w: 1.5, h: 0.04 },
        iconRect: slide.icon ? { x: 10.1, y: 1.0, w: 2.1, h: 2.1 } : undefined,
        contentRect: { x: 0.5, y: 2.05, w: slide.icon ? 9.3 : 12.33, h: 3.6 },
        notesRect: { x: 0.5, y: 6.18, w: 12.33, h: 0.7 },
        maxItems: 6,
      }
  }
}