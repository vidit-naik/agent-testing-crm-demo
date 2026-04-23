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
  connecting: 'Connecting',
  'connected-syncing': 'Connected — syncing',
  synced: 'Connected',
  offline: 'Offline',
}

const COLUMNS = ['Prospect', 'Qualified', 'Proposal', 'Won'] as const
type Col = (typeof COLUMNS)[number]
type Card = { id: string; title: string; col: Col; value: number; owner: string }

const SEED: Card[] = [
  { id: 'a', title: 'ACME Q3 upgrade', col: 'Prospect', value: 45000, owner: 'Alice' },
  { id: 'b', title: 'Globex renewal', col: 'Qualified', value: 120000, owner: 'Bob' },
  { id: 'c', title: 'Initech pilot', col: 'Proposal', value: 30000, owner: 'Carol' },
  { id: 'd', title: 'Umbrella expansion', col: 'Won', value: 220000, owner: 'Dan' },
  { id: 'e', title: 'Stark co-marketing', col: 'Prospect', value: 80000, owner: 'Emma' },
  { id: 'f', title: 'Wayne services', col: 'Qualified', value: 60000, owner: 'Bob' },
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
    if (sync !== 'synced') return
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, col: to } : c)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Pipeline board</h1>
          <p className="text-muted-foreground">Drag cards between stages. Changes sync in real time.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${COLORS[sync]}`} />
          <span className="text-xs font-medium" data-sync-state={sync}>
            {LABELS[sync]}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.col === col)
          const colTotal = colCards.reduce((sum, c) => sum + c.value, 0)
          return (
            <div key={col} className="rounded-lg border bg-card min-h-[320px] flex flex-col">
              <div className="px-3 py-2 border-b flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">{col}</h3>
                <span className="text-xs text-muted-foreground">${colTotal.toLocaleString()}</span>
              </div>
              <div className="p-2 space-y-2 flex-1">
                {colCards.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border bg-background p-3 hover:shadow-sm transition"
                    data-card-id={c.id}
                    data-card-col={col}
                  >
                    <div className="font-medium text-sm">{c.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{c.owner}</span>
                      <span className="text-xs font-medium">${c.value.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {COLUMNS.filter((t) => t !== col).map((to) => (
                        <button
                          key={to}
                          onClick={() => move(c.id, to)}
                          className="text-[10px] rounded border px-1.5 py-0.5 hover:bg-accent text-muted-foreground"
                        >
                          → {to}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
