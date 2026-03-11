/**
 * CenterArea: slide carousel + toolbar
 */

import { useEffect, useState } from 'react'
import { Download, Palette, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSlidesStore } from '../../stores/slides-store'
import { usePaletteStore } from '../../stores/palette-store'
import { useChatStore } from '../../stores/chat-store'
import { SlideCard } from './SlideCard.tsx'
import { GeneratedSlideCard } from './GeneratedSlideCard.tsx'
import { createAssistantMessage } from '../../application/chat-use-case'

const CARD_SCALE = 0.55

export function CenterArea() {
  const { work } = useSlidesStore()
  const { tokens } = usePaletteStore()
  const { addMessage } = useChatStore()
  const [selected, setSelected] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const generatedSlides = work.generatedPreviewSlides
  const slides = generatedSlides ?? work.slides

  useEffect(() => {
    setSelected((current) => Math.min(current, Math.max(slides.length - 1, 0)))
  }, [slides.length])

  const exportPptx = async () => {
    if (slides.length === 0) return
    setExporting(true)
    setExportError(null)
    try {
      const result = work.pptxCode
        ? await window.electronAPI.pptx.generate(work.pptxCode, tokens, work.title || 'presentation')
        : await window.electronAPI.pptx.exportSlides(work.slides, tokens, work.title || 'presentation')

      if (result.success) {
        addMessage(createAssistantMessage(`PPTX generation complete.${result.path ? ` Saved to ${result.path}.` : ''}`))
      } else if (result.error !== 'Cancelled') {
        setExportError(result.error ?? 'Failed to export PPTX')
        addMessage(createAssistantMessage(`PPTX generation failed: ${result.error ?? 'Unknown error'}`))
      }
    } finally {
      setExporting(false)
    }
  }

  const exportThmx = async () => {
    if (!tokens) return
    await window.electronAPI.theme.exportThmx(tokens)
  }

  return (
    <div className="flex flex-col h-full gap-3 p-3" style={{ background: 'var(--panel-bg)' }}>
      {/* Toolbar */}
      <div
        className="flex-none flex items-center justify-between px-4 border"
        style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)', height: 40, minHeight: 40 }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Preview
          {slides.length > 0 && (
            <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-muted)' }}>
              {selected + 1} / {slides.length}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {tokens && (
            <button
              onClick={exportThmx}
              className="flex h-8 items-center gap-1.5 border px-3 text-xs font-medium transition-colors"
              style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)', borderColor: 'var(--panel-border)' }}
            >
              <Palette size={12} />
              .thmx
            </button>
          )}
          {slides.length > 0 && (
            <button
              onClick={exportPptx}
              disabled={exporting}
              className="flex h-8 items-center gap-1.5 px-3 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Download size={12} />
              {exporting ? 'Saving…' : 'Export .pptx'}
            </button>
          )}
        </div>
      </div>

      {exportError && (
        <div
          className="flex-none border px-4 py-2 text-xs"
          style={{ borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c' }}
        >
          {exportError}
        </div>
      )}

      {/* Main slide view */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--panel-border)' }}
      >
        {slides.length === 0 ? (
          <div className="text-center" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-4 opacity-30">🖥️</div>
            <p className="text-sm">Slide preview will appear here.</p>
            <p className="text-xs mt-1">Start a conversation in the chat panel.</p>
          </div>
        ) : (
          <>
            {/* Previous button — absolutely positioned inside the main container */}
            <button
              onClick={() => setSelected((i) => Math.max(0, i - 1))}
              disabled={selected === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center border disabled:opacity-20 transition-opacity"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--panel-border)', background: 'var(--surface)' }}
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>

            {generatedSlides ? (
              <GeneratedSlideCard
                slide={generatedSlides[selected]}
                scale={CARD_SCALE}
                selected
              />
            ) : (
              <SlideCard
                slide={work.slides[selected]}
                theme={tokens}
                scale={CARD_SCALE}
                selected
              />
            )}

            {/* Next button */}
            <button
              onClick={() => setSelected((i) => Math.min(slides.length - 1, i + 1))}
              disabled={selected === slides.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center border disabled:opacity-20 transition-opacity"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--panel-border)', background: 'var(--surface)' }}
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {slides.length > 1 && (
        <div
          className="flex-none flex gap-3 overflow-x-auto border px-4 py-3"
          style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)' }}
        >
          {generatedSlides ? generatedSlides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setSelected(i)}
              className="flex-none focus:outline-none"
              aria-label={`Slide ${slide.number}: ${slide.title}`}
            >
              <GeneratedSlideCard
                slide={slide}
                scale={0.12}
                selected={i === selected}
                onClick={() => setSelected(i)}
              />
            </button>
          )) : work.slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setSelected(i)}
              className="flex-none focus:outline-none"
              aria-label={`Slide ${slide.number}: ${slide.title}`}
            >
              <SlideCard
                slide={slide}
                theme={tokens}
                scale={0.12}
                selected={i === selected}
                onClick={() => setSelected(i)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
