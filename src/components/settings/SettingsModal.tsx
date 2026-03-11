/**
 * SettingsModal: env var configuration for the Copilot SDK + Azure AI Foundry
 */

import { useState, useEffect } from 'react'
import { X, Save, Loader2, Eye, EyeOff } from 'lucide-react'

interface Props {
  onClose: () => void
}

const FIELDS: { key: string; label: string; placeholder: string; secret?: boolean; hint?: string }[] = [
  {
    key: 'GITHUB_TOKEN',
    label: 'GitHub Token',
    placeholder: 'ghp_...',
    secret: true,
    hint: 'GitHub PAT with Copilot entitlement',
  },
  {
    key: 'MODEL_PROVIDER',
    label: 'Model Provider',
    placeholder: 'openai or azure (optional)',
    hint: 'Optional. If AZURE_OPENAI_ENDPOINT is set, the app will use Azure OpenAI / Foundry automatically.',
  },
  {
    key: 'AZURE_OPENAI_ENDPOINT',
    label: 'Azure OpenAI Endpoint',
    placeholder: 'https://your-resource.openai.azure.com/openai/v1',
    hint: 'Use the full v1 base URL, including /openai/v1.',
  },
  {
    key: 'AZURE_OPENAI_API_KEY',
    label: 'Azure OpenAI API Key',
    placeholder: 'Leave empty to use DefaultAzureCredential (az login)',
    secret: true,
    hint: 'API key for Azure OpenAI. Optional if using Azure CLI or managed identity.',
  },
  {
    key: 'AZURE_TENANT_ID',
    label: 'Azure Tenant ID',
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    hint: 'Required when you have multiple tenants. Ensures DefaultAzureCredential targets the correct tenant.',
  },
  {
    key: 'MODEL_NAME',
    label: 'Model Name',
    placeholder: 'gpt-5',
    hint: 'Deployment or model name (optional)',
  },
]

export function SettingsModal({ onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    if (!window.electronAPI?.settings) {
      setLoading(false)
      return
    }
    window.electronAPI.settings.get()
      .then((v) => { setValues(v); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!window.electronAPI?.settings) return
    setSaving(true)
    setSaved(false)
    try {
      await window.electronAPI.settings.save(values)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel */}
      <div
        className="flex flex-col w-[520px] max-h-[90vh] border"
        style={{ background: 'var(--surface)', borderColor: 'var(--panel-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 border-b"
          style={{ borderColor: 'var(--panel-border)', height: 48, minHeight: 48 }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 transition-colors hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Values are saved to the app's user-data folder and applied to the running process immediately.
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                For slide images, the app works without an API key by using direct image URLs in `imageQuery`, Google image search discovery, and a public fallback provider.
              </p>

              {FIELDS.map(({ key, label, placeholder, secret, hint }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </label>
                  <div
                    className="flex items-center gap-2 border px-3"
                    style={{ height: 36, background: 'var(--input-bg)', borderColor: 'var(--panel-border)' }}
                  >
                    <input
                      type={secret && !showSecret ? 'password' : 'text'}
                      value={values[key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="flex-1 bg-transparent text-xs outline-none"
                      style={{ color: 'var(--text-primary)' }}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {secret && (
                      <button
                        onClick={() => setShowSecret((s) => !s)}
                        className="flex-none"
                        style={{ color: 'var(--text-muted)' }}
                        tabIndex={-1}
                        aria-label={showSecret ? 'Hide' : 'Show'}
                      >
                        {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    )}
                  </div>
                  {hint && (
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{hint}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 border-t"
          style={{ borderColor: 'var(--panel-border)', height: 52, minHeight: 52 }}
        >
          <button
            onClick={onClose}
            className="px-4 text-xs font-medium border transition-colors"
            style={{ height: 32, borderColor: 'var(--panel-border)', color: 'var(--text-secondary)', background: 'transparent' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 text-xs font-semibold transition-colors disabled:opacity-50"
            style={{ height: 32, background: saved ? '#16a34a' : 'var(--accent)', color: '#fff' }}
          >
            {saving
              ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
              : saved
              ? 'Saved ✓'
              : <><Save size={13} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}
