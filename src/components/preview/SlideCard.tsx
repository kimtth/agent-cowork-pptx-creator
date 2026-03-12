/**
 * SlideCard: HTML-rendered slide preview (13.33:7.5 aspect ratio)
 * Styled by ThemeTokens and driven by the shared slide layout spec.
 */

import type { CSSProperties } from 'react'
import { Icon } from '@iconify/react'
import type { SlideItem } from '../../domain/entities/slide-work'
import type { ThemeTokens } from '../../domain/entities/palette'
import { DEFAULT_THEME_C } from '../../domain/theme/default-theme'
import { getSlideLayoutSpec, getVisibleBullets, splitComparisonBullets, toPreviewPx, type RectSpec, type SlideLayoutSpec } from '../../domain/layout/slide-layout-spec'
import { normalizeIconName } from '../../domain/icons/iconify'
import { toLocalImageUrl } from '../../application/local-image-url.ts'

interface Props {
  slide: SlideItem
  theme: ThemeTokens | null
  scale?: number
  onClick?: () => void
  selected?: boolean
}

const FS = (base: number, scale: number) => base * scale

function hex(c: string) {
  return `#${c.replace('#', '')}`
}

function getAccentSequence(C: ThemeTokens['C']) {
  return [C.ACCENT1, C.ACCENT2, C.ACCENT3, C.ACCENT4, C.ACCENT5, C.ACCENT6].map(hex)
}

function getSlideAccentIndex(slide: SlideItem): number {
  const mapped = {
    blue: 0,
    green: 2,
    purple: 3,
    teal: 4,
    orange: 5,
  } as const
  return mapped[slide.accent] ?? 0
}

function rectStyle(rect: RectSpec | undefined, scale: number): CSSProperties {
  if (!rect) return {}
  return {
    position: 'absolute',
    left: toPreviewPx(rect.x, scale),
    top: toPreviewPx(rect.y, scale),
    width: toPreviewPx(rect.w, scale),
    height: toPreviewPx(rect.h, scale),
  }
}

function Title({ text, style }: { text: string; style: CSSProperties }) {
  return <div style={{ fontFamily: 'Segoe UI, system-ui', letterSpacing: '-0.01em', lineHeight: 1.15, overflow: 'hidden', ...style }}>{text}</div>
}

function DefaultHeader({ slide, spec, scale, color, primary }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string }) {
  return (
    <>
      {spec.accentRect && <div style={{ ...rectStyle(spec.accentRect, scale), background: primary }} />}
      {spec.titleRect && <Title text={slide.title} style={{ ...rectStyle(spec.titleRect, scale), fontSize: FS(11, scale), fontWeight: 700, color }} />}
      {slide.keyMessage && spec.keyMessageRect && (
        <div style={{ ...rectStyle(spec.keyMessageRect, scale), fontSize: FS(10, scale), fontWeight: 700, color, fontFamily: 'Segoe UI, system-ui' }}>{slide.keyMessage}</div>
      )}
    </>
  )
}

function HeroIcon({ spec, slide, scale, border, fill }: { spec: SlideLayoutSpec; slide: SlideItem; scale: number; border: string; fill: string }) {
  if (!spec.iconRect) return null
  const selectedImages = slide.selectedImages ?? []
  const primaryImagePath = slide.imagePath ?? selectedImages[0]?.imagePath ?? null
  if (primaryImagePath) {
    const src = toLocalImageUrl(primaryImagePath)
    return (
      <div style={{ ...rectStyle(spec.iconRect, scale), border: `${1 * scale}px solid ${border}`, background: fill, borderRadius: 8 * scale, overflow: 'hidden' }}>
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {selectedImages.length > 1 ? (
          <div style={{ position: 'absolute', right: 6 * scale, bottom: 6 * scale, padding: `${2 * scale}px ${5 * scale}px`, borderRadius: 999 * scale, background: 'rgba(15, 23, 42, 0.78)', color: '#fff', fontSize: FS(6, scale), fontFamily: 'Segoe UI, system-ui', fontWeight: 700 }}>
            +{selectedImages.length - 1}
          </div>
        ) : null}
      </div>
    )
  }

  if (!slide.icon) return null
  const icon = normalizeIconName(slide.icon)
  if (!icon) return null
  return (
    <div style={{ ...rectStyle(spec.iconRect, scale), border: `${1 * scale}px solid ${border}`, background: fill, borderRadius: 8 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon icon={icon} style={{ width: toPreviewPx(spec.iconRect.w * 0.52, scale), height: toPreviewPx(spec.iconRect.h * 0.52, scale), color: border }} />
    </div>
  )
}

function TitleSlide({ slide, spec, scale, color, primary, secondary, muted }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; secondary: string; muted: string }) {
  return (
    <>
      {spec.accentRect && <div style={{ ...rectStyle(spec.accentRect, scale), background: primary }} />}
      {spec.titleRect && <Title text={slide.title} style={{ ...rectStyle(spec.titleRect, scale), fontSize: FS(19, scale), fontWeight: 700, color }} />}
      {slide.keyMessage && spec.keyMessageRect && <div style={{ ...rectStyle(spec.keyMessageRect, scale), fontSize: FS(10.5, scale), color: secondary, fontFamily: 'Segoe UI, system-ui' }}>{slide.keyMessage}</div>}
      <HeroIcon spec={spec} slide={slide} scale={scale} border={muted} fill={'rgba(0,0,0,0.03)'} />
    </>
  )
}

function SectionSlide({ slide, spec, scale, primary, light }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; primary: string; light: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: primary }} />
      {spec.accentRect && <div style={{ ...rectStyle(spec.accentRect, scale), background: light, opacity: 0.5 }} />}
      {spec.titleRect && <Title text={slide.title} style={{ ...rectStyle(spec.titleRect, scale), fontSize: FS(15, scale), fontWeight: 700, color: light }} />}
      {spec.keyMessageRect && <Title text={slide.keyMessage || slide.title} style={{ ...rectStyle(spec.keyMessageRect, scale), fontSize: FS(20, scale), fontWeight: 700, color: light }} />}
    </>
  )
}

function AgendaSlide({ slide, spec, scale, color, primary, accents }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; accents: string[] }) {
  const items = getVisibleBullets(slide)
  const content = spec.contentRect!
  return (
    <>
      <DefaultHeader slide={slide} spec={spec} scale={scale} color={color} primary={primary} />
      {items.map((item, index) => {
        const y = content.y + index * (spec.rowStep ?? 0.58)
        return (
          <div key={index} style={{ position: 'absolute', left: toPreviewPx(content.x, scale), top: toPreviewPx(y, scale), width: toPreviewPx(content.w, scale), display: 'flex', alignItems: 'center', gap: 8 * scale }}>
            <div style={{ width: 16 * scale, height: 16 * scale, borderRadius: 2 * scale, background: accents[index % accents.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: FS(7, scale), fontWeight: 700 }}>{index + 1}</div>
            <div style={{ fontSize: FS(8.5, scale), color, fontFamily: 'Segoe UI, system-ui', overflow: 'hidden' }}>{item}</div>
          </div>
        )
      })}
    </>
  )
}

function BulletsSlide({ slide, spec, scale, color, primary, muted, accents }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; muted: string; accents: string[] }) {
  const items = getVisibleBullets(slide)
  const content = spec.contentRect!
  return (
    <>
      <DefaultHeader slide={slide} spec={spec} scale={scale} color={color} primary={primary} />
      <HeroIcon spec={spec} slide={slide} scale={scale} border={muted} fill={'rgba(0,0,0,0.03)'} />
      <div style={{ ...rectStyle(content, scale), display: 'flex', flexDirection: 'column', gap: 5 * scale, overflow: 'hidden' }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 6 * scale, alignItems: 'flex-start' }}>
            <div style={{ width: 4 * scale, height: 4 * scale, borderRadius: '50%', background: accents[index % accents.length], marginTop: 3.5 * scale, flexShrink: 0 }} />
            <div style={{ fontSize: FS(8, scale), color, fontFamily: 'Segoe UI, system-ui', lineHeight: 1.4 }}>{item}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function CardsSlide({ slide, spec, scale, color, primary, muted, accents }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; muted: string; accents: string[] }) {
  const items = getVisibleBullets(slide)
  const grid = spec.cards!
  const cols = Math.min(items.length, grid.columns) || 1
  return (
    <>
      <DefaultHeader slide={slide} spec={spec} scale={scale} color={color} primary={primary} />
      {items.map((item, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        const x = grid.startX + col * (grid.cardW + grid.gapX)
        const y = grid.startY + row * (grid.cardH + grid.gapY)
        const w = cols === 1 ? 11.8 : grid.cardW
        return (
          <div key={index} style={{ ...rectStyle({ x, y, w, h: grid.cardH }, scale), background: muted, borderRadius: 4 * scale, padding: `${8 * scale}px ${10 * scale}px`, borderTop: `${3 * scale}px solid ${accents[index % accents.length]}`, overflow: 'hidden' }}>
            <div style={{ fontSize: FS(7, scale), color, fontFamily: 'Segoe UI, system-ui', lineHeight: 1.4 }}>{item}</div>
          </div>
        )
      })}
    </>
  )
}

function StatsSlide({ slide, spec, scale, color, primary, secondary, muted, accents }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; secondary: string; muted: string; accents: string[] }) {
  const items = getVisibleBullets(slide)
  const stats = spec.stats!
  return (
    <>
      <DefaultHeader slide={slide} spec={spec} scale={scale} color={color} primary={primary} />
      {items.map((item, index) => {
        const [value, ...rest] = item.split(/[:：]/)
        const x = stats.startX + index * (stats.boxW + stats.gapX)
        const tone = accents[index % accents.length]
        return (
          <div key={index} style={{ ...rectStyle({ x, y: stats.startY, w: stats.boxW, h: stats.boxH }, scale), textAlign: 'center', background: muted, borderRadius: 6 * scale, border: `${1.5 * scale}px solid ${tone}`, overflow: 'hidden' }}>
            <div style={{ marginTop: 10 * scale, fontSize: FS(18, scale), fontWeight: 800, color: tone, lineHeight: 1 }}>{value.trim()}</div>
            <div style={{ marginTop: 4 * scale, padding: `0 ${6 * scale}px`, fontSize: FS(7, scale), color, fontFamily: 'Segoe UI, system-ui' }}>{(rest.join(':') || item).trim()}</div>
          </div>
        )
      })}
    </>
  )
}

function ComparisonSlide({ slide, spec, scale, color, primary, secondary }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; secondary: string }) {
  const [leftItems, rightItems] = splitComparisonBullets(slide)
  const comparison = spec.comparison!
  return (
    <>
      <DefaultHeader slide={slide} spec={spec} scale={scale} color={color} primary={primary} />
      {[
        { items: leftItems, rect: comparison.left, tone: primary },
        { items: rightItems, rect: comparison.right, tone: secondary },
      ].map(({ items, rect, tone }, index) => (
        <div key={index} style={{ ...rectStyle({ x: rect.x, y: rect.y - 0.24, w: rect.w, h: rect.h + 0.24 }, scale), overflow: 'hidden' }}>
          <div style={{ height: 3 * scale, background: tone, borderRadius: 2 * scale, marginBottom: 6 * scale }} />
          {items.map((item, itemIndex) => (
            <div key={itemIndex} style={{ fontSize: FS(7.5, scale), color, fontFamily: 'Segoe UI, system-ui', lineHeight: 1.4, marginBottom: 4 * scale }}>{item}</div>
          ))}
        </div>
      ))}
    </>
  )
}

function TimelineSlide({ slide, spec, scale, color, primary, muted, accents }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; muted: string; accents: string[] }) {
  const timeline = spec.timeline!
  return (
    <>
      <DefaultHeader slide={slide} spec={spec} scale={scale} color={color} primary={primary} />
      <div style={{ position: 'absolute', left: toPreviewPx(timeline.lineX, scale), top: toPreviewPx(timeline.lineY, scale), width: 2 * scale, height: toPreviewPx(timeline.lineH, scale), background: muted }} />
      {getVisibleBullets(slide).map((item, index) => {
        const y = timeline.startY + index * timeline.stepY
        const tone = accents[index % accents.length]
        return (
          <div key={index}>
            <div style={{ position: 'absolute', left: toPreviewPx(timeline.dotX, scale), top: toPreviewPx(y, scale), width: toPreviewPx(timeline.dotSize, scale), height: toPreviewPx(timeline.dotSize, scale), borderRadius: '50%', background: tone, border: `${2 * scale}px solid ${tone}` }} />
            <div style={{ position: 'absolute', left: toPreviewPx(timeline.textX, scale), top: toPreviewPx(y - 0.03, scale), width: toPreviewPx(timeline.textW, scale), fontSize: FS(8, scale), color, fontFamily: 'Segoe UI, system-ui', overflow: 'hidden' }}>{item}</div>
          </div>
        )
      })}
    </>
  )
}

function SummarySlide({ slide, spec, scale, color, primary, secondary }: { slide: SlideItem; spec: SlideLayoutSpec; scale: number; color: string; primary: string; secondary: string }) {
  const summaryBox = spec.summaryBox!
  const contentRect = spec.contentRect!
  return (
    <>
      <DefaultHeader slide={slide} spec={spec} scale={scale} color={color} primary={primary} />
      <div style={{ ...rectStyle(summaryBox, scale), border: `1px solid ${primary}`, borderRadius: 4 * scale, padding: `${10 * scale}px ${14 * scale}px`, overflow: 'hidden' }}>
        <div style={{ fontSize: FS(8, scale), color: primary, fontWeight: 600, marginBottom: 4 * scale }}>Key Message</div>
        <div style={{ fontSize: FS(9, scale), color, fontFamily: 'Segoe UI, system-ui' }}>{slide.keyMessage}</div>
      </div>
      <div style={{ ...rectStyle(contentRect, scale), display: 'flex', flexDirection: 'column', gap: 4 * scale, overflow: 'hidden' }}>
        {getVisibleBullets(slide).map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 6 * scale, alignItems: 'flex-start' }}>
            <div style={{ fontSize: FS(8, scale), color: secondary, flexShrink: 0 }}>→</div>
            <div style={{ fontSize: FS(8, scale), color, fontFamily: 'Segoe UI, system-ui' }}>{item}</div>
          </div>
        ))}
      </div>
    </>
  )
}

export function SlideCard({ slide, theme, scale = 1, onClick, selected }: Props) {
  const C = theme?.C ?? DEFAULT_THEME_C
  const accents = getAccentSequence(C)
  const accentIndex = getSlideAccentIndex(slide)
  const bg = hex(C.LIGHT)
  const primary = accents[accentIndex % accents.length] ?? hex(C.PRIMARY ?? C.ACCENT1)
  const text = hex(C.TEXT ?? C.DARK)
  const secondary = accents[(accentIndex + 1) % accents.length] ?? hex(C.SECONDARY ?? C.ACCENT2)
  const muted = hex(C.BORDER ?? 'E1E1E1')
  const spec = getSlideLayoutSpec(slide)

  const W = 13.33 * 96 * scale
  const H = 7.5 * 96 * scale

  return (
    <div
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        width: W,
        height: H,
        background: slide.layout === 'section' ? primary : bg,
        borderRadius: 4 * scale,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? `0 0 0 ${2 * scale}px ${primary}` : `0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.25)`,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 * scale, background: primary }} />
      <div style={{ position: 'absolute', top: 8 * scale, right: 10 * scale, fontSize: 8 * scale, fontWeight: 600, color: slide.layout === 'section' ? '#ffffff' : primary, opacity: 0.6, fontFamily: 'Segoe UI, system-ui' }}>{slide.number}</div>

      {slide.layout === 'title' && <TitleSlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} secondary={secondary} muted={muted} />}
      {slide.layout === 'section' && <SectionSlide slide={slide} spec={spec} scale={scale} primary={primary} light={bg} />}
      {slide.layout === 'agenda' && <AgendaSlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} accents={accents} />}
      {slide.layout === 'cards' && <CardsSlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} muted={hex(C.LIGHT2)} accents={accents} />}
      {slide.layout === 'stats' && <StatsSlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} secondary={secondary} muted={muted} accents={accents} />}
      {slide.layout === 'comparison' && <ComparisonSlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} secondary={secondary} />}
      {slide.layout === 'timeline' && <TimelineSlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} muted={muted} accents={accents} />}
      {slide.layout === 'summary' && <SummarySlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} secondary={secondary} />}
      {(slide.layout === 'bullets' || slide.layout === 'diagram') && <BulletsSlide slide={slide} spec={spec} scale={scale} color={text} primary={primary} muted={muted} accents={accents} />}
    </div>
  )
}
