/**
 * PaletteCanvas: HTML5 Canvas palette preview
 * Ported from oppadu's palette generator (grid layout, WCAG contrast, "A" font preview).
 */

import { useEffect, useRef } from 'react'
import type { PaletteColor } from '../../domain/entities/palette'

interface Props {
  colors: PaletteColor[]
}

const CELL_W = 120
const CELL_H = 110

function getLayout(count: number): { rows: number; cols: number } {
  if (count <= 13) return { rows: 1, cols: count }
  if (count <= 26) return { rows: 2, cols: Math.ceil(count / 2) }
  return { rows: 3, cols: Math.ceil(count / 3) }
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const linearize = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function getTextColor(hex: string): string {
  return getRelativeLuminance(hex) > 0.179 ? '#1B1B1B' : '#FFFFFF'
}

function hexToRgbLabel(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  return `R${r} G${g} B${b}`
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width <= maxW) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 2)
}

export function PaletteCanvas({ colors }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || colors.length === 0) return
    const { rows, cols } = getLayout(colors.length)
    canvas.width = cols * CELL_W
    canvas.height = rows * CELL_H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    colors.forEach((color, idx) => {
      const row = Math.floor(idx / cols)
      const col = idx % cols
      const x = col * CELL_W
      const y = row * CELL_H
      const textColor = getTextColor(color.hex)

      // Fill
      ctx.fillStyle = color.hex
      ctx.fillRect(x, y, CELL_W, CELL_H)

      // Name (top, bold 11px)
      ctx.fillStyle = textColor
      ctx.font = 'bold 11px "Segoe UI", system-ui'
      ctx.textAlign = 'left'
      const lines = wrapText(ctx, color.name, CELL_W - 12)
      lines.forEach((line, li) => {
        ctx.fillText(line, x + 6, y + 18 + li * 13)
      })

      // RGB label (small, lower area)
      ctx.font = '9px "Segoe UI", system-ui'
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.7
      ctx.fillText(hexToRgbLabel(color.hex), x + 6, y + CELL_H - 22)
      ctx.globalAlpha = 1

      // HEX
      ctx.font = '9px monospace'
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.85
      ctx.fillText(color.hex.toUpperCase(), x + 6, y + CELL_H - 10)
      ctx.globalAlpha = 1

      // "A" font preview (bottom-right, bold 36px)
      ctx.font = 'bold 36px "Segoe UI", system-ui'
      ctx.fillStyle = textColor
      ctx.globalAlpha = 0.2
      ctx.textAlign = 'right'
      ctx.fillText('A', x + CELL_W - 4, y + CELL_H - 6)
      ctx.globalAlpha = 1
      ctx.textAlign = 'left'
    })
  }, [colors])

  if (colors.length === 0) return null
  const { rows, cols } = getLayout(colors.length)

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: 6,
        maxWidth: cols * CELL_W,
      }}
      aria-label="Color palette preview"
    />
  )
}
