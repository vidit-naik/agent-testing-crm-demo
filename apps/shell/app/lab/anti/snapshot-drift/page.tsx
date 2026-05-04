'use client'

import { useState } from 'react'
import { Keyboard, Plus, RefreshCw, Trash2 } from 'lucide-react'

type Shortcut = { id: string; label: string; keys: string; enabled: boolean }

const INITIAL: Shortcut[] = [
  { id: 'new-deal', label: 'New deal', keys: 'D', enabled: true },
  { id: 'new-contact', label: 'New contact', keys: 'C', enabled: true },
  { id: 'search', label: 'Search', keys: '/', enabled: true },
  { id: 'dashboard', label: 'Go to dashboard', keys: 'G then H', enabled: false },
]

export default function ShortcutsPage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(INITIAL)
  const [draft, setDraft] = useState({ label: '', keys: '' })

  const update = (id: string, patch: Partial<Shortcut>) => {
    setShortcuts((current) =>
      current.map((shortcut) => (shortcut.id === id ? { ...shortcut, ...patch } : shortcut))
    )
  }

  const add = () => {
    if (!draft.label.trim() || !draft.keys.trim()) return
    setShortcuts((current) => [
      ...current,
      { id: draft.label.toLowerCase().replace(/\s+/g, '-'), label: draft.label, keys: draft.keys, enabled: true },
    ])
    setDraft({ label: '', keys: '' })
  }

  const reset = () => {
    setShortcuts(INITIAL)
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Keyboard className="h-7 w-7 text-primary" />
            Keyboard shortcuts
          </h1>
          <p className="text-muted-foreground">Customize actions and key bindings.</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border bg-card">
          <div className="divide-y">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.id} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_180px_100px_auto] md:items-center">
                <input
                  value={shortcut.label}
                  onChange={(e) => update(shortcut.id, { label: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                />
                <input
                  value={shortcut.keys}
                  onChange={(e) => update(shortcut.id, { keys: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
                <label className="flex items-center justify-between gap-2 text-sm">
                  Enabled
                  <input
                    type="checkbox"
                    checked={shortcut.enabled}
                    onChange={(e) => update(shortcut.id, { enabled: e.target.checked })}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShortcuts((current) => current.filter((item) => item.id !== shortcut.id))}
                  className="inline-flex justify-center rounded-md border p-2 hover:bg-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Add shortcut</h2>
            <div className="mt-3 space-y-3">
              <input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Action"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                value={draft.keys}
                onChange={(e) => setDraft({ ...draft, keys: e.target.value })}
                placeholder="Keys"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              />
              <button
                type="button"
                onClick={add}
                disabled={!draft.label.trim() || !draft.keys.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Total" value={String(shortcuts.length)} />
              <Summary label="Enabled" value={String(shortcuts.filter((item) => item.enabled).length)} />
              <Summary label="Disabled" value={String(shortcuts.filter((item) => !item.enabled).length)} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
