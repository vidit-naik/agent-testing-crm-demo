'use client'

import { useEffect, useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

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
  const [droppedWrites, setDroppedWrites] = useState(0)

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
      setDroppedWrites((d) => d + 1)
      return
    }
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, col: to } : c)))
  }

  const force = (s: SyncState) => setSync(s)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live deal board"
        subtitle='Yjs-powered collaborative kanban. Looks "connected" but silently drops writes until fully synced.'
        route="/lab/live-board"
        patterns={['Yjs', 'sync ≠ online', 'silent write drop']}
      />

      <ScenarioPanel
        story={
          <>
            Two teammates edit the same deal board. A write made before the initial sync completes
            is silently discarded. The UI still shows <em>Connected</em>, so nothing looks wrong.
          </>
        }
        steps={[
          'Wait for state to reach "Connected — syncing" (yellow)',
          'Try to move a card — the UI does not update (write dropped)',
          'Wait for state → "Connected" (green)',
          'Move the same card — now it updates',
          'Verify the dropped-write counter stayed at its value through steady state',
        ]}
        success={[
          <>
            Test waits for <code className="font-mono text-xs">data-sync-state=&quot;synced&quot;</code>,
            not merely for a green indicator or the &ldquo;Connected&rdquo; text.
          </>,
          'Writes before sync are NOT asserted as having landed.',
          'No reliance on timing constants — wait on the attribute.',
        ]}
        gotcha={
          <>
            &ldquo;Connected — syncing&rdquo; looks healthy. Many tests assume sync ⇒ online and drop writes.
            Use the data attribute, not the label, to decide when writes are safe.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${COLORS[sync]}`} />
            <span className="text-sm font-medium" data-sync-state={sync}>
              {LABELS[sync]}
            </span>
          </div>
          <div className="flex gap-1">
            {(['connecting', 'connected-syncing', 'synced', 'offline'] as SyncState[]).map((s) => (
              <button
                key={s}
                onClick={() => force(s)}
                className={`text-[11px] rounded-md border px-2 py-1 ${
                  sync === s ? 'bg-accent' : 'hover:bg-accent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {droppedWrites > 0 && (
          <div
            className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900"
            data-dropped-writes={droppedWrites}
          >
            {droppedWrites} write{droppedWrites === 1 ? '' : 's'} dropped while not fully synced.
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col} className="rounded-lg border bg-background p-3 min-h-[240px]">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{col}</h3>
              <div className="space-y-2">
                {cards
                  .filter((c) => c.col === col)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="rounded-md border bg-card p-3"
                      data-card-id={c.id}
                      data-card-col={col}
                    >
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
    </div>
  )
}
