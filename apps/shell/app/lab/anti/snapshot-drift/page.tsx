'use client'

import { useEffect, useState } from 'react'
import { Keyboard, RefreshCw } from 'lucide-react'

function rid() {
  return 'k' + Math.floor(Math.random() * 1e6)
}

const SHORTCUTS = [
  { label: 'New deal', keys: 'D' },
  { label: 'New contact', keys: 'C' },
  { label: 'Search', keys: '/' },
  { label: 'Go to dashboard', keys: 'G then H' },
]

export default function ShortcutsPage() {
  const [tick, setTick] = useState(0)
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds(SHORTCUTS.map(() => rid()))
  }, [tick])

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Keyboard className="h-7 w-7 text-primary" />
          Keyboard shortcuts
        </h1>
        <p className="text-muted-foreground">Customize and rebind actions.</p>
      </div>

      <div className="rounded-lg border bg-card">
        <ul className="divide-y">
          {SHORTCUTS.map((s, i) => (
            <li
              key={ids[i] ?? i}
              className="flex items-center justify-between px-4 py-3"
              data-ref={ids[i]}
              aria-ref={ids[i]}
            >
              <div>
                <div className="font-medium text-sm">{s.label}</div>
                <div className="text-xs text-muted-foreground font-mono">ref: {ids[i]}</div>
              </div>
              <kbd className="rounded-md border bg-muted px-2 py-1 text-xs font-mono">{s.keys}</kbd>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setTick((t) => t + 1)}
        className="rounded-md border border-input px-3 py-1.5 text-sm inline-flex items-center gap-1.5 hover:bg-accent"
      >
        <RefreshCw className="h-4 w-4" />
        Regenerate refs
      </button>
    </div>
  )
}
