import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChatStore } from '../../stores/chat-store'
import { useSlidesStore } from '../../stores/slides-store'
import { usePaletteStore } from '../../stores/palette-store'
import { useDataSourcesStore } from '../../stores/data-sources-store'
import { createUserMessage, historyToIpc } from '../../application/chat-use-case'
import { getAvailableIconChoices } from '../../domain/icons/iconify'

export function ChatPanel() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, pendingContent, pendingThinking, addMessage, removeMessage } = useChatStore()
  const { work, setStreaming } = useSlidesStore()
  const streaming = work.isStreaming
  const { tokens, selectedIconCollection } = usePaletteStore()
  const { files: dataSources, urls: urlSources } = useDataSourcesStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingContent])

  const send = async () => {
    const msg = input.trim()
    if (!msg || streaming) return
    setInput('')
    setStreaming(true)

    addMessage(createUserMessage(msg))

    const availableIcons = getAvailableIconChoices(selectedIconCollection)

    window.electronAPI.chat.send(msg, historyToIpc(messages), {
      title: work.title,
      slides: work.slides,
      designBrief: work.designBrief,
      framework: work.framework,
      theme: tokens,
      dataSources,
      urlSources,
      iconProvider: 'iconify',
      iconCollection: selectedIconCollection,
      availableIcons,
    })
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3" style={{ background: 'var(--panel-bg)' }}>
      {/* Header */}
      <div
        className="flex-none flex items-center px-4 border text-sm font-semibold"
        style={{ color: 'var(--text-primary)', borderColor: 'var(--panel-border)', background: 'var(--surface)', height: 40, minHeight: 40 }}
      >
        Chat
      </div>

      {/* Messages */}
      <div
        className="flex-1 min-h-0 overflow-y-auto border px-4 py-4 space-y-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--panel-border)' }}
      >
        {messages.length === 0 && (
          <div className="text-center mt-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm mb-1">👋 Ready to build slides.</p>
            <p className="text-xs">Describe your presentation to start.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1.5 group">
            <div className="flex items-center justify-between gap-2 px-1">
              <span
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: msg.role === 'user' ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {msg.role === 'user' ? 'You' : 'Agent'}
              </span>
              <button
                type="button"
                onClick={() => removeMessage(msg.id)}
                className="flex h-5 w-5 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Remove message"
                title="Remove message"
              >
                <X size={12} />
              </button>
            </div>
            {msg.role === 'user' ? (
              <div
                className="px-4 py-3 text-sm"
                style={{
                  background: '#eef2ff',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {msg.thinking && (
                  <details
                    className="text-xs px-4 py-3 border"
                    style={{ color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderColor: 'var(--panel-border)' }}
                  >
                    <summary className="cursor-pointer">Thinking…</summary>
                    <pre className="mt-2 whitespace-pre-wrap leading-relaxed">{msg.thinking}</pre>
                  </details>
                )}
                <div
                  className="px-4 py-3 text-sm prose prose-sm max-w-none"
                  style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Streaming assistant message */}
        {streaming && (pendingContent || pendingThinking) && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>
              Agent
            </span>
            {pendingThinking && (
              <div
                className="text-xs px-4 py-3 border italic"
                style={{ color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderColor: 'var(--panel-border)' }}
              >
                {pendingThinking.slice(-200)}
              </div>
            )}
            {pendingContent && (
              <div
                className="px-4 py-3 text-sm prose prose-sm max-w-none"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{pendingContent}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Streaming indicator */}
        {streaming && !pendingContent && !pendingThinking && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>
              Agent
            </span>
            <div
              className="px-4 py-3 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--panel-border)' }}
            >
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input composer */}
      <div
        className="flex-none border"
        style={{ borderColor: 'var(--panel-border)', background: 'var(--surface)' }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message the agent…"
          rows={3}
          disabled={streaming}
          className="w-full resize-none border-b bg-transparent text-sm outline-none"
          style={{
            display: 'block',
            color: 'var(--text-primary)',
            padding: '12px 14px',
            maxHeight: 200,
            lineHeight: '1.6',
            borderColor: 'var(--panel-border)',
            background: 'var(--input-bg)',
          }}
        />
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter ↵ send · Shift+Enter new line</p>
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className="flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-40 transition-colors"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              height: 32,
              paddingLeft: 16,
              paddingRight: 16,
            }}
            aria-label="Send"
          >
            {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>{streaming ? 'Sending' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
