/**
 * WorkspacePanel: slide navigator + data sources + palette access
 */

import { useState } from 'react'
import { SlideNavigator } from './SlideNavigator.tsx'
import { DataSources } from './DataSources.tsx'
import { PalettePanel } from '../palette/PalettePanel.tsx'

type Tab = 'slides' | 'data' | 'palette'

export function WorkspacePanel() {
  const [tab, setTab] = useState<Tab>('slides')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'slides', label: 'Slides' },
    { id: 'data', label: 'Data' },
    { id: 'palette', label: 'Palette' },
  ]

  return (
    <div className="flex h-full flex-col gap-3 p-3" style={{ background: 'var(--panel-bg)' }}>
      {/* Tab bar */}
      <div
        className="flex-none flex items-stretch border"
        style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)', height: 40, minHeight: 40 }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex flex-1 items-center justify-center text-sm font-medium transition-colors border-b-2"
            style={{
              color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: tab === t.id ? 'var(--accent)' : 'transparent',
              background: 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto border" style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)' }}>
        {tab === 'slides' && <SlideNavigator />}
        {tab === 'data' && <DataSources />}
        {tab === 'palette' && <PalettePanel />}
      </div>
    </div>
  )
}
