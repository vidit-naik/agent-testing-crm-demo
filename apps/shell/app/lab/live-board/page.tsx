'use client'

import { useEffect, useState } from 'react'

type SyncState = 'connecting' | 'connected-syncing' | 'synced' | 'offline'

const COLORS: Record<SyncState, string> = {
  connecting: 'bg-slate-400',
  'connected-syncing': 'bg-amber-500',
  synced: 'bg-emerald-500',
  offline: 'bg-rose-500',
}

const LABELS: Record<SyncState, string> = {
  connecting: 'Connecting...',
  'connected-syncing': 'Connected — syncing',
  synced: 'Connected',
  offline: 'Offline',
}

const COLUMNS = ['Prospect', 'Qualified', 'Proposal', 'Won'] as const
type Col = (typeof COLUMNS)[number]
type Card = { id: string; title: string; col: Col; value: number }

const SEED: Card[] = [
  { id: 'a', title: 'ACME Q3 upgrade', col: 'Prospect', value: 45000 },
  { id: 'b', title: 'Globex renewal', col: 'Qualified', value: 120000 },
  { id: 'c', title: 'Initech pilot', col: 'Proposal', value: 30000 },
  { id: 'd', title: 'Umbrella expansion', col: 'Won', value: 220000 },
]

export default function LiveBoardPage() {
  const [sync, setSync] = useState<SyncState>('connecting')
  const [cards, setCards] = useState<Card[]>(SEED)

  useEffect(() => {
    const t1 = setTimeout(() => setSync('connected-syncing'), 700)
    const t2 = setTimeout(() => setSync('synced'), 3500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const move = (id: string, to: Col) => {
    if (sync !== 'synced') {
      // Writes during syncing phase are dropped silently — matches Yjs footgun.
      return
    }
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, col: to } : c)))
  }

  const force = (s: SyncState) => setSync(s)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live deal board</h1>
          <p className="text-muted-foreground">
            Yjs + WebSocket. Writes dropped during <code className="font-mono text-xs">connected-syncing</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${COLORS[sync]}`} />
          <span className="text-sm font-medium" data-sync-state={sync}>
            {LABELS[sync]}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {(['connecting', 'connected-syncing', 'synced', 'offline'] as SyncState[]).map((s) => (
          <button
            key={s}
            onClick={() => force(s)}
            className="rounded-md border px-2 py-1 hover:bg-accent"
          >
            Force {s}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col} className="rounded-lg border bg-card p-3 min-h-[240px]">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{col}</h3>
            <div className="space-y-2">
              {cards
                .filter((c) => c.col === col)
                .map((c) => (
                  <div key={c.id} className="rounded-md border bg-background p-3">
                    <div className="font-medium text-sm">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ${c.value.toLocaleString()}
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {COLUMNS.filter((t) => t !== col).map((to) => (
                        <button
                          key={to}
                          onClick={() => move(c.id, to)}
                          className="text-[10px] rounded border px-1.5 py-0.5 hover:bg-accent"
                        >
                          → {to}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
