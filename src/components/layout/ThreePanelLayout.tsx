import { useRef, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

interface Props {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

const MIN_LEFT = 420
const MAX_LEFT = 620
const MIN_RIGHT = 300
const MAX_RIGHT = 460

export function ThreePanelLayout({ left, center, right }: Props) {
  const [leftW, setLeftW] = useState(460)
  const [rightW, setRightW] = useState(340)
  const containerRef = useRef<HTMLDivElement>(null)

  const startDrag = useCallback(
    (which: 'left' | 'right') => (e: React.MouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startLeft = leftW
      const startRight = rightW

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX
        if (which === 'left') {
          setLeftW(Math.max(MIN_LEFT, Math.min(MAX_LEFT, startLeft + dx)))
        } else {
          setRightW(Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, startRight - dx)))
        }
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [leftW, rightW],
  )

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{ background: 'var(--panel-bg)' }}
    >
      {/* Left: Chat */}
      <div
        className="flex-none flex flex-col overflow-hidden border-r"
        style={{ width: leftW, borderColor: 'var(--panel-border)' }}
      >
        {left}
      </div>

      {/* Divider left */}
      <div
        className="flex-none w-1 cursor-col-resize hover:bg-indigo-500/30 transition-colors"
        style={{ background: 'var(--panel-border)' }}
        onMouseDown={startDrag('left')}
      />

      {/* Center: Preview */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {center}
      </div>

      {/* Divider right */}
      <div
        className="flex-none w-1 cursor-col-resize hover:bg-indigo-500/30 transition-colors"
        style={{ background: 'var(--panel-border)' }}
        onMouseDown={startDrag('right')}
      />

      {/* Right: Workspace */}
      <div
        className="flex-none flex flex-col overflow-hidden border-l"
        style={{ width: rightW, borderColor: 'var(--panel-border)' }}
      >
        {right}
      </div>
    </div>
  )
}
