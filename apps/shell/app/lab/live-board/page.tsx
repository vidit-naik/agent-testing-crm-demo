'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Filter, RefreshCw, Save } from 'lucide-react'

type SyncState = 'connecting' | 'connected-syncing' | 'synced' | 'offline'

const COLORS: Record<SyncState, string> = {
  connecting: 'bg-slate-400',
  'connected-syncing': 'bg-amber-500',
  synced: 'bg-emerald-500',
  offline: 'bg-rose-500',
}

const LABELS: Record<SyncState, string> = {
  connecting: 'Connecting',
  'connected-syncing': 'Syncing',
  synced: 'Live',
  offline: 'Offline',
}

const COLUMNS = ['Prospect', 'Qualified', 'Proposal', 'Won'] as const
type Col = (typeof COLUMNS)[number]
type Card = {
  id: string
  title: string
  col: Col
  value: number
  owner: string
  nextStep: string
  lastActivity: string
  stale: boolean
}

const SEED: Card[] = [
  { id: 'a', title: 'ACME Q3 upgrade', col: 'Prospect', value: 45000, owner: 'Alice', nextStep: 'Discovery call', lastActivity: 'Today', stale: false },
  { id: 'b', title: 'Globex renewal', col: 'Qualified', value: 120000, owner: 'Bob', nextStep: 'Security review', lastActivity: 'Yesterday', stale: false },
  { id: 'c', title: 'Initech pilot', col: 'Proposal', value: 30000, owner: 'Carol', nextStep: 'Send redlines', lastActivity: '16 days ago', stale: true },
  { id: 'd', title: 'Umbrella expansion', col: 'Won', value: 220000, owner: 'Dan', nextStep: 'Hand off to CS', lastActivity: 'Today', stale: false },
  { id: 'e', title: 'Stark co-marketing', col: 'Prospect', value: 80000, owner: 'Emma', nextStep: 'Confirm sponsor', lastActivity: '4 days ago', stale: false },
  { id: 'f', title: 'Wayne services', col: 'Qualified', value: 60000, owner: 'Bob', nextStep: 'Pricing review', lastActivity: '21 days ago', stale: true },
]

export default function LiveBoardPage() {
  const [sync, setSync] = useState<SyncState>('connecting')
  const [cards, setCards] = useState<Card[]>(SEED)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState(SEED[0].id)
  const [ownerFilter, setOwnerFilter] = useState('All')
  const [staleOnly, setStaleOnly] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [conflict, setConflict] = useState<Card | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setSync('connected-syncing'), 700)
    const t2 = setTimeout(() => setSync('synced'), 2500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const owners = useMemo(() => ['All', ...Array.from(new Set(cards.map((card) => card.owner)))], [cards])

  const visibleCards = useMemo(
    () =>
      cards.filter((card) => {
        const ownerMatch = ownerFilter === 'All' || card.owner === ownerFilter
        const staleMatch = !staleOnly || card.stale
        return ownerMatch && staleMatch
      }),
    [cards, ownerFilter, staleOnly]
  )

  const selected = cards.find((card) => card.id === selectedId) || cards[0]

  const move = (id: string, to: Col) => {
    if (sync !== 'synced') return
    setCards((current) => current.map((card) => (card.id === id ? { ...card, col: to } : card)))
    setSelectedId(id)
  }

  const updateSelected = (patch: Partial<Card>) => {
    setCards((current) => current.map((card) => (card.id === selected.id ? { ...card, ...patch } : card)))
    setDirty(true)
  }

  const saveSelected = () => {
    setDirty(false)
  }

  const simulateRemoteUpdate = () => {
    setConflict({
      ...selected,
      value: selected.value + 15000,
      nextStep: 'Remote owner updated forecast',
      lastActivity: 'Just now',
    })
  }

  const resolveConflict = (source: 'local' | 'remote') => {
    if (source === 'remote' && conflict) {
      setCards((current) => current.map((card) => (card.id === conflict.id ? conflict : card)))
    }
    setConflict(null)
    setDirty(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Pipeline board</h1>
          <p className="text-muted-foreground">Manage opportunities across the sales pipeline.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${COLORS[sync]}`} />
          <span className="text-xs font-medium" data-sync-state={sync}>
            {LABELS[sync]}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4 text-muted-foreground" />
                Filters
              </div>
              <select
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={staleOnly}
                  onChange={(event) => setStaleOnly(event.target.checked)}
                />
                Stale deals
              </label>
              <button
                type="button"
                onClick={() => setSync(sync === 'offline' ? 'synced' : 'offline')}
                className="ml-auto inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <RefreshCw className="h-4 w-4" />
                {sync === 'offline' ? 'Reconnect' : 'Go offline'}
              </button>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            {COLUMNS.map((col) => {
              const colCards = visibleCards.filter((card) => card.col === col)
              const colTotal = colCards.reduce((sum, card) => sum + card.value, 0)
              return (
                <div
                  key={col}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) move(draggingId, col)
                    setDraggingId(null)
                  }}
                  className="flex min-h-[480px] flex-col rounded-lg border bg-card"
                >
                  <div className="flex items-baseline justify-between border-b px-3 py-2">
                    <h3 className="text-sm font-semibold">{col}</h3>
                    <span className="text-xs text-muted-foreground">${colTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex-1 space-y-2 p-2">
                    {colCards.map((card) => (
                      <article
                        key={card.id}
                        draggable={sync === 'synced'}
                        onDragStart={() => setDraggingId(card.id)}
                        onDragEnd={() => setDraggingId(null)}
                        onClick={() => setSelectedId(card.id)}
                        className={`cursor-pointer rounded-md border bg-background p-3 transition hover:shadow-sm ${
                          selected.id === card.id ? 'border-primary ring-1 ring-primary' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm">{card.title}</div>
                          {card.stale && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{card.owner}</span>
                          <span className="text-xs font-medium">${card.value.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">{card.nextStep}</div>
                      </article>
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{selected.title}</h2>
                <p className="text-sm text-muted-foreground">{selected.col}</p>
              </div>
              {dirty && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Unsaved</span>}
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Owner</span>
                <input
                  value={selected.owner}
                  onChange={(event) => updateSelected({ owner: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Value</span>
                <input
                  type="number"
                  value={selected.value}
                  onChange={(event) => updateSelected({ value: Number(event.target.value) })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Next step</span>
                <input
                  value={selected.nextStep}
                  onChange={(event) => updateSelected({ nextStep: event.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.stale}
                  onChange={(event) => updateSelected({ stale: event.target.checked })}
                />
                Mark as stale
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={saveSelected}
                disabled={!dirty}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                onClick={simulateRemoteUpdate}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Refresh
              </button>
            </div>
          </section>

          {conflict && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <h2 className="text-sm font-semibold">Update available</h2>
              <p className="mt-2 text-sm">{conflict.nextStep}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => resolveConflict('local')}
                  className="rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium"
                >
                  Keep local
                </button>
                <button
                  type="button"
                  onClick={() => resolveConflict('remote')}
                  className="rounded-md bg-amber-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Use update
                </button>
              </div>
            </section>
          )}

          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Activity</h2>
            <div className="mt-4 space-y-3 text-sm">
              <TimelineItem title="Stage changed" detail={`${selected.title} is in ${selected.col}`} />
              <TimelineItem title="Last activity" detail={selected.lastActivity} />
              <TimelineItem title="Next step" detail={selected.nextStep} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function TimelineItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="font-medium">{title}</div>
      <div className="text-muted-foreground">{detail}</div>
    </div>
  )
}
