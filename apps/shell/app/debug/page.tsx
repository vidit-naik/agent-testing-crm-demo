'use client'

import { useEffect, useState } from 'react'

type Knob = { key: string; label: string; type: 'checkbox' | 'number' | 'select'; options?: string[]; default: any }

const KNOBS: Knob[] = [
  { key: 'debug', label: 'debug=1 — expose data-conditional-rule etc.', type: 'checkbox', default: false },
  { key: 'showReason', label: 'showReason=1 — add aria-describedby on wizard Next', type: 'checkbox', default: false },
  { key: 'fixCache', label: 'fixCache=1 — invalidate EC caches immediately', type: 'checkbox', default: false },
  { key: 'broken', label: 'broken=1 — EC endpoints never settle', type: 'checkbox', default: false },
  { key: 'latency', label: 'latency (ms)', type: 'number', default: 0 },
  { key: 'fail', label: 'failRate (0..1)', type: 'number', default: 0 },
  { key: 'ec', label: 'ec delay (ms)', type: 'number', default: 2500 },
  { key: 'locale', label: 'locale', type: 'select', options: ['de', 'en'], default: 'de' },
]

export default function DebugPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [state, setState] = useState<Record<string, any>>({})
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    setEnabled(process.env.NEXT_PUBLIC_DEBUG_PANEL === '1')
    try {
      const raw = localStorage.getItem('crm-debug-knobs')
      if (raw) setState(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    fetch('/api/blocker')
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []))
      .catch(() => {})
  }, [])

  const save = () => {
    try {
      localStorage.setItem('crm-debug-knobs', JSON.stringify(state))
    } catch {}
  }

  const queryString = Object.entries(state)
    .filter(([, v]) => v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v === true ? 1 : v))}`)
    .join('&')

  if (enabled === null) return <div className="p-6">Loading...</div>
  if (!enabled) {
    return (
      <div className="rounded-lg border bg-card p-6 max-w-2xl">
        <h1 className="text-xl font-semibold mb-2">/debug</h1>
        <p className="text-sm text-muted-foreground">
          Disabled. Set <code className="font-mono text-xs">NEXT_PUBLIC_DEBUG_PANEL=1</code> in shell env.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Debug panel</h1>
        <p className="text-muted-foreground">
          Agent-blind. Flips knobs per session. Append <code>?{queryString || 'key=value'}</code> to any route.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        {KNOBS.map((k) => (
          <div key={k.key} className="flex items-center gap-3">
            <label className="text-sm w-72">{k.label}</label>
            {k.type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={!!state[k.key]}
                onChange={(e) => setState((s) => ({ ...s, [k.key]: e.target.checked }))}
              />
            ) : k.type === 'number' ? (
              <input
                type="number"
                value={state[k.key] ?? ''}
                onChange={(e) =>
                  setState((s) => ({ ...s, [k.key]: e.target.value === '' ? undefined : Number(e.target.value) }))
                }
                className="rounded-md border border-input bg-background px-2 py-1 text-sm w-32"
              />
            ) : (
              <select
                value={state[k.key] ?? k.default}
                onChange={(e) => setState((s) => ({ ...s, [k.key]: e.target.value }))}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                {k.options!.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        <div className="pt-2 flex gap-2">
          <button
            onClick={save}
            className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
          >
            Save to localStorage
          </button>
          <code className="text-xs bg-muted rounded px-2 py-1.5">?{queryString}</code>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Recent /api/blocker reports
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reports.</p>
        ) : (
          <div className="space-y-1 text-xs font-mono max-h-64 overflow-y-auto">
            {reports.map((r, i) => (
              <div key={i} className="border-b py-1">
                <span className="text-amber-700">{r.type}</span> · {r.page} · {r.at}
                {r.detail && <div className="text-muted-foreground">{r.detail}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
