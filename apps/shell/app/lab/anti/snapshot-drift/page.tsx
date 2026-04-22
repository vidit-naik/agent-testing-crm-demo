'use client'

import { useEffect, useState } from 'react'

function rid() {
  return 'e' + Math.floor(Math.random() * 1e6)
}

export default function SnapshotDriftPage() {
  const [tick, setTick] = useState(0)
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    setIds([rid(), rid(), rid(), rid()])
  }, [tick])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Snapshot drift</h1>
        <p className="text-muted-foreground">
          Synthetic <code>aria-ref</code>-like IDs rotate on every reload. Agents must re-snapshot.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {['Alpha', 'Bravo', 'Charlie', 'Delta'].map((label, i) => (
            <button
              key={ids[i] ?? i}
              aria-ref={ids[i]}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              {label} ({ids[i]})
            </button>
          ))}
        </div>
        <button
          onClick={() => setTick((t) => t + 1)}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
        >
          Re-render (rotate IDs)
        </button>
      </div>
    </div>
  )
}
