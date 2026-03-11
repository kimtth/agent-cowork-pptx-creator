import type { CSSProperties } from 'react'
import type { GeneratedSlidePreview, GeneratedSlidePreviewObject } from '../../domain/entities/slide-work'

interface Props {
  slide: GeneratedSlidePreview
  scale?: number
  onClick?: () => void
  selected?: boolean
}

const SLIDE_W = 13.33 * 96
const SLIDE_H = 7.5 * 96

function toPx(value: number, scale: number) {
  return value * 96 * scale
}

function color(value?: string | null, fallback = 'transparent') {
  if (!value) return fallback
  return value.startsWith('#') ? value : `#${value}`
}

function imageSource(object: GeneratedSlidePreviewObject): string | null {
  if (object.data) return object.data
  if (!object.path) return null
  if (/^(?:https?:|data:|file:)/i.test(object.path)) return object.path
  return `file:///${object.path.replace(/\\/g, '/')}`
}

function objectStyle(object: GeneratedSlidePreviewObject, scale: number): CSSProperties {
  return {
    position: 'absolute',
    left: toPx(object.x, scale),
    top: toPx(object.y, scale),
    width: toPx(object.w, scale),
    height: toPx(object.h, scale),
    transform: object.rotate ? `rotate(${object.rotate}deg)` : undefined,
    opacity: typeof object.transparency === 'number' ? Math.max(0, 1 - object.transparency / 100) : 1,
  }
}

function renderText(object: GeneratedSlidePreviewObject, scale: number) {
  return (
    <div
      style={{
        ...objectStyle(object, scale),
        color: color(object.color, '#1B1B1B'),
        background: color(object.fillColor),
        border: object.lineColor ? `${(object.lineWidth ?? 1) * scale}px solid ${color(object.lineColor)}` : undefined,
        fontSize: (object.fontSize ?? 18) * scale,
        fontWeight: 600,
        lineHeight: 1.25,
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        display: 'flex',
        alignItems: object.valign === 'ctr' || object.valign === 'mid' ? 'center' : object.valign === 'b' ? 'flex-end' : 'flex-start',
        justifyContent: object.align === 'center' ? 'center' : object.align === 'right' ? 'flex-end' : 'flex-start',
        textAlign: object.align === 'center' ? 'center' : object.align === 'right' ? 'right' : 'left',
        padding: 2 * scale,
        fontFamily: 'Segoe UI, system-ui, sans-serif',
      }}
    >
      {object.text}
    </div>
  )
}

function renderShape(object: GeneratedSlidePreviewObject, scale: number) {
  const baseStyle: CSSProperties = {
    ...objectStyle(object, scale),
    background: color(object.fillColor),
    border: object.lineColor ? `${(object.lineWidth ?? 1) * scale}px solid ${color(object.lineColor)}` : undefined,
  }

  if (object.shape === 'ellipse') {
    baseStyle.borderRadius = '50%'
  } else if (object.shape === 'roundRect' || object.shape === 'round1Rect' || object.shape === 'round2SameRect') {
    baseStyle.borderRadius = 8 * scale
  }

  if (object.shape === 'line') {
    baseStyle.background = color(object.lineColor, '#1B1B1B')
    baseStyle.height = Math.max((object.lineWidth ?? 1) * scale, 1)
  }

  return <div style={baseStyle} />
}

function renderImage(object: GeneratedSlidePreviewObject, scale: number) {
  const src = imageSource(object)
  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        ...objectStyle(object, scale),
        objectFit: 'cover',
      }}
    />
  )
}

export function GeneratedSlideCard({ slide, scale = 1, onClick, selected }: Props) {
  return (
    <div
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => event.key === 'Enter' && onClick() : undefined}
      style={{
        width: SLIDE_W * scale,
        height: SLIDE_H * scale,
        background: color(slide.backgroundColor, '#FFFFFF'),
        borderRadius: 4 * scale,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? `0 0 0 ${2 * scale}px var(--accent)` : `0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.25)`,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {slide.backgroundImageData && (
        <img
          src={slide.backgroundImageData}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
      {slide.objects.map((object, index) => {
        if (object.kind === 'image') return <div key={index}>{renderImage(object, scale)}</div>
        if (object.kind === 'shape') return <div key={index}>{renderShape(object, scale)}</div>
        return <div key={index}>{renderText(object, scale)}</div>
      })}
    </div>
  )
}