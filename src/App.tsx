import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { ThreePanelLayout } from './components/layout/ThreePanelLayout.tsx'
import { ChatPanel } from './components/chat/ChatPanel.tsx'
import { CenterArea } from './components/preview/CenterArea.tsx'
import { WorkspacePanel } from './components/workspace/WorkspacePanel.tsx'
import { WorkspaceAreaButton } from './components/workspace/WorkspaceAreaButton.tsx'
import { SettingsModal } from './components/settings/SettingsModal.tsx'
import { useChatStore } from './stores/chat-store.ts'
import { useSlidesStore } from './stores/slides-store.ts'
import { usePaletteStore } from './stores/palette-store.ts'
import { extractPptxCodeBlock } from './application/chat-use-case.ts'

export default function App() {
  const { appendContent, appendThinking, flushAssistantMessage } = useChatStore()
  const { applyScenario, applySlideUpdate, applyResolvedImages, setFramework, setStreaming, setPptxCode, setGeneratedPreviewSlides } = useSlidesStore()
  const { tokens } = usePaletteStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const api = window.electronAPI

    async function resolveImagesForCurrentSlides(slides: Array<{ number: number; title: string; keyMessage: string; bullets: string[]; imageQuery?: string | null }>) {
      const resolved = await api.images.resolveForSlides(slides)
      if (resolved.length > 0) applyResolvedImages(resolved)
    }

    const unsubs = [
      api.chat.onStream((delta) => {
        if (delta.content) appendContent(delta.content)
        if (delta.thinking) appendThinking(delta.thinking)
      }),
      api.chat.onScenario((payload) => {
        applyScenario(payload)
        void resolveImagesForCurrentSlides(payload.slides)
      }),
      api.chat.onSlideUpdate((slide) => {
        applySlideUpdate(slide)
        void resolveImagesForCurrentSlides([{ number: slide.number, title: slide.title, keyMessage: slide.keyMessage, bullets: slide.bullets, imageQuery: slide.imageQuery ?? null }])
      }),
      api.chat.onFrameworkSuggested((payload) => {
        setFramework(payload.primary as Parameters<typeof setFramework>[0])
      }),
      api.chat.onDone(() => {
        const code = extractPptxCodeBlock(useChatStore.getState().pendingContent)
        flushAssistantMessage()
        setStreaming(false)

        if (!code) {
          setGeneratedPreviewSlides(null)
          return
        }

        setPptxCode(code)
        void api.pptx.inspectCode(code, tokens)
          .then((generatedSlides) => {
            setGeneratedPreviewSlides(generatedSlides)
          })
          .catch(() => {
            setGeneratedPreviewSlides(null)
          })
      }),
      api.chat.onError((msg) => {
        appendContent(`\n\n⚠️ ${msg}`)
        flushAssistantMessage()
        setStreaming(false)
      }),
    ]

    return () => unsubs.forEach((u) => u())
  }, [appendContent, appendThinking, flushAssistantMessage, applyScenario, applySlideUpdate, applyResolvedImages, setFramework, setStreaming, setPptxCode, setGeneratedPreviewSlides, tokens])

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ background: 'var(--panel-bg)' }}>
      {/* Top bar */}
      <div
        className="flex-none flex items-center justify-between px-4 border-b"
        style={{
          height: 40,
          minHeight: 40,
          background: 'var(--surface)',
          borderColor: 'var(--panel-border)',
          WebkitAppRegion: 'drag',
        } as React.CSSProperties}
      >
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          PPTX Slide Agent
        </span>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <WorkspaceAreaButton />
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center w-7 h-7 transition-colors hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Three-panel workspace */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ThreePanelLayout
          left={<ChatPanel />}
          center={<CenterArea />}
          right={<WorkspacePanel />}
        />
      </div>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
