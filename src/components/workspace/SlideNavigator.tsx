/**
 * SlideNavigator: numbered slide list with per-slide actions
 */

import { useEffect, useState } from 'react'
import { useSlidesStore } from '../../stores/slides-store'
import { FRAMEWORK_OPTIONS, getFrameworkMeta } from '../../domain/frameworks'
import type { GeneratedSlidePreview, SlideItem } from '../../domain/entities/slide-work'

const LAYOUT_BADGE: Record<string, string> = {
  title: 'TTL', agenda: 'AGN', section: 'SEC', bullets: 'BUL',
  cards: 'CRD', stats: 'STA', comparison: 'CMP', timeline: 'TML',
  diagram: 'DGM', summary: 'SUM',
}

export function SlideNavigator() {
  const { work, deleteSlide, moveToAppendix, setFramework } = useSlidesStore()
  const slides = work.slides
  const generatedSlides = work.generatedPreviewSlides
  const selectedFramework = getFrameworkMeta(work.framework)

  if (slides.length === 0 && (!generatedSlides || generatedSlides.length === 0)) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center"
        style={{ color: 'var(--text-muted)' }}>
        <p className="text-sm">No slides yet.</p>
        <p className="text-xs mt-1">Ask the agent to create a presentation.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>
      {/* Section header */}
      <div
        className="flex-none flex flex-col gap-2 px-4 py-3 border-b"
        style={{ color: 'var(--text-secondary)', borderColor: 'var(--panel-border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>{(generatedSlides?.length ?? slides.length)} slide{(generatedSlides?.length ?? slides.length) !== 1 ? 's' : ''}</span>
          {work.framework && (
            <span
              className="px-2 py-0.5 text-[10px] font-semibold border"
              style={{ background: 'var(--surface-hover)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
            >
              {selectedFramework?.label ?? work.framework}
            </span>
          )}
        </div>
        {generatedSlides && generatedSlides.length > 0 && (
          <p className="text-[11px] leading-4" style={{ color: 'var(--accent)' }}>
            Slides below are read from the generated PPTX code preview.
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Business Framework
          </label>
          <select
            value={work.framework ?? ''}
            onChange={(e) => {
              const next = e.target.value
              if (next) setFramework(next as Parameters<typeof setFramework>[0])
            }}
            className="h-8 border px-2 text-xs outline-none"
            style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            <option value="" disabled>Select a framework</option>
            {FRAMEWORK_OPTIONS.map((framework) => (
              <option key={framework.value} value={framework.value}>
                {framework.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] leading-4" style={{ color: 'var(--text-muted)' }}>
            {selectedFramework?.description ?? 'Choose a structure for the story so slide recommendations follow a consistent business logic.'}
          </p>
        </div>
      </div>

      {/* Slide list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {generatedSlides && generatedSlides.length > 0
          ? generatedSlides.map((slide) => <GeneratedSlideListItem key={slide.id} slide={slide} />)
          : slides.map((slide) => (
              <SlideListItem
                key={slide.id}
                slide={slide}
                onMoveToAppendix={() => moveToAppendix(slide.number)}
                onDelete={() => deleteSlide(slide.number)}
              />
            ))}
      </div>
    </div>
  )
}

function GeneratedSlideListItem({ slide }: { slide: GeneratedSlidePreview }) {
  return (
    <div
      className="px-3 py-3 border mb-2 last:mb-0"
      style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-none w-7 h-7 flex items-center justify-center text-xs font-bold border"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)', borderColor: 'var(--panel-border)' }}
        >
          {slide.number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 border flex-none"
              style={{ background: 'var(--surface-hover)', color: 'var(--accent)', borderColor: 'var(--panel-border)' }}
            >
              PPTX
            </span>
            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {slide.title}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {slide.objects.length} object{slide.objects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}

function SlideListItem({
  slide,
  onMoveToAppendix,
  onDelete,
}: {
  slide: SlideItem
  onMoveToAppendix: () => void
  onDelete: () => void
}) {
  const { setSlideImageQuery, applyResolvedImages } = useSlidesStore()
  const [imageQuery, setImageQuery] = useState(slide.imageQuery ?? '')
  const [isResolving, setIsResolving] = useState(false)

  useEffect(() => {
    setImageQuery(slide.imageQuery ?? '')
  }, [slide.imageQuery])

  async function resolveImage(nextQuery: string) {
    const trimmed = nextQuery.trim()
    setSlideImageQuery(slide.number, trimmed || null)
    setIsResolving(true)
    try {
      const resolved = await window.electronAPI.images.resolveForSlides([
        {
          number: slide.number,
          title: slide.title,
          keyMessage: slide.keyMessage,
          bullets: slide.bullets,
          imageQuery: trimmed || null,
        },
      ])
      if (resolved.length > 0) applyResolvedImages(resolved)
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <div
      className="px-3 py-3 border mb-2 group hover:bg-[var(--surface-hover)] transition-colors last:mb-0"
      style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-none w-7 h-7 flex items-center justify-center text-xs font-bold border"
          style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)', borderColor: 'var(--panel-border)' }}
        >
          {slide.number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 border flex-none"
              style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)', borderColor: 'var(--panel-border)' }}
            >
              {LAYOUT_BADGE[slide.layout] ?? slide.layout.slice(0, 3).toUpperCase()}
            </span>
            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {slide.title}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {slide.keyMessage}
          </p>
        </div>

        <div className="flex-none flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionBtn label="Move to appendix" onClick={onMoveToAppendix}>📎</ActionBtn>
          <ActionBtn label="Delete slide" onClick={onDelete}>🗑</ActionBtn>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Slide Image Query
        </label>
        <div className="flex items-center gap-2">
          <input
            value={imageQuery}
            onChange={(e) => setImageQuery(e.target.value)}
            onBlur={() => {
              const trimmed = imageQuery.trim()
              if (trimmed !== (slide.imageQuery ?? '')) {
                setSlideImageQuery(slide.number, trimmed || null)
              }
            }}
            placeholder="Describe the image or paste a direct image URL"
            className="flex-1 h-8 border px-2 text-xs outline-none"
            style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={() => void resolveImage(imageQuery)}
            disabled={isResolving}
            className="h-8 px-3 text-xs font-semibold transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {isResolving ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        <p className="text-[11px] leading-4" style={{ color: 'var(--text-muted)' }}>
          {slide.imagePath
            ? `Saved image: ${slide.imageAttribution ?? 'Downloaded to workspace/images'}`
            : 'Uses direct image URLs, Google image discovery, then public fallback if needed.'}
        </p>
      </div>
    </div>
  )
}

function ActionBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center border text-xs hover:bg-[var(--surface-hover)] transition-colors"
      style={{ borderColor: 'var(--panel-border)' }}
    >
      {children}
    </button>
  )
}
