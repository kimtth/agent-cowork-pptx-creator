/**
 * ThemeSlotEditor: 12 OOXML theme color slots with colored dropdowns
 */

import { usePaletteStore } from '../../stores/palette-store'
import { buildThemeTokens } from '../../application/palette-use-case'
import type { ThemeSlots } from '../../domain/entities/palette'

const SLOT_LABELS: { key: keyof ThemeSlots; label: string; description: string }[] = [
  { key: 'dk1', label: 'Dark 1 (dk1)', description: 'Primary text' },
  { key: 'lt1', label: 'Light 1 (lt1)', description: 'Primary background' },
  { key: 'dk2', label: 'Dark 2 (dk2)', description: 'Secondary text' },
  { key: 'lt2', label: 'Light 2 (lt2)', description: 'Secondary background' },
  { key: 'accent1', label: 'Accent 1', description: 'Primary accent' },
  { key: 'accent2', label: 'Accent 2', description: 'Secondary accent' },
  { key: 'accent3', label: 'Accent 3', description: 'Tertiary accent' },
  { key: 'accent4', label: 'Accent 4', description: 'Quaternary accent' },
  { key: 'accent5', label: 'Accent 5', description: 'Quinary accent' },
  { key: 'accent6', label: 'Accent 6', description: 'Senary accent' },
  { key: 'hlink', label: 'Hyperlink', description: 'Link color' },
  { key: 'folHlink', label: 'Followed Link', description: 'Visited link' },
]

export function ThemeSlotEditor() {
  const { slots, colors, setSlots, themeName, setThemeName, commitTokens } = usePaletteStore()

  if (!slots) return null

  const handleChange = (key: keyof ThemeSlots, hex: string) => {
    const next = { ...slots, [key]: hex.replace('#', '') }
    setSlots(next)
    commitTokens()
  }

  return (
    <section className="border" style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)' }}>
      <div
        className="flex items-center px-4 border-b text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-secondary)', borderColor: 'var(--panel-border)', height: 40, minHeight: 40 }}
      >
        Theme Slots
      </div>

      <div className="px-4 py-4">
      {/* Theme name */}
      <input
        type="text"
        value={themeName}
        onChange={(e) => {
          setThemeName(e.target.value)
          commitTokens()
        }}
        placeholder="Theme name"
        className="w-full px-3 py-2 text-xs mb-4 border outline-none"
        style={{
          background: 'var(--input-bg)',
          borderColor: 'var(--panel-border)',
          color: 'var(--text-primary)',
        }}
      />

      <div className="flex flex-col gap-2">
        {SLOT_LABELS.map(({ key, label }) => {
          const current = `#${slots[key]}`
          return (
            <div key={key} className="flex items-center gap-2 h-8">
              {/* Color swatch (click to open picker) */}
              <div
                className="relative flex-none w-7 h-7 border overflow-hidden"
                style={{ borderColor: 'var(--panel-border)' }}
              >
                <input
                  type="color"
                  value={current}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label={`${label} color picker`}
                />
                <div className="w-full h-full" style={{ background: current }} />
              </div>

              {/* Dropdown */}
              <select
                value={`#${slots[key]}`}
                onChange={(e) => handleChange(key, e.target.value)}
                className="flex-1 h-8 text-xs px-2 border outline-none"
                style={{
                  background: `#${slots[key]}`,
                  borderColor: 'var(--panel-border)',
                  color: getContrastText(`#${slots[key]}`),
                  cursor: 'pointer',
                }}
                aria-label={label}
              >
                {colors.map((c) => (
                  <option
                    key={c.hex}
                    value={c.hex}
                    style={{ background: c.hex, color: getContrastText(c.hex) }}
                  >
                    {c.name} — {c.hex}
                  </option>
                ))}
              </select>

              {/* Slot label */}
              <div
                className="flex-none text-[10px] text-right"
                style={{ color: 'var(--text-secondary)', width: 64 }}
              >
                {label.split('(')[0].trim()}
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </section>
  )
}

function getContrastText(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#1B1B1B' : '#FFFFFF'
}
