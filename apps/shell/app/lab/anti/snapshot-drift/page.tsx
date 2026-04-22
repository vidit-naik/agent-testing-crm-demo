'use client'

import { useEffect, useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

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
    <div className="space-y-6">
      <PageHeader
        title="Snapshot drift"
        subtitle="aria-ref IDs rotate on every render. Any cached snapshot ref is stale the moment the page updates."
        route="/lab/anti/snapshot-drift"
        patterns={['anti-pattern', 'snapshot freshness', 'stale ref']}
      />

      <ScenarioPanel
        story={
          <>
            Playwright&apos;s <code className="font-mono text-xs">_snapshotForAI</code> assigns
            volatile <code className="font-mono text-xs">aria-ref</code> IDs. Re-using one after the
            tree changes selects the wrong node. This page demonstrates the drift.
          </>
        }
        steps={[
          'Take a snapshot, note the aria-ref for "Bravo"',
          'Click "Re-render" to rotate the IDs',
          'Take a fresh snapshot and click via the new aria-ref',
          'Reusing the old ref would hit a different (or missing) button',
        ]}
        success={[
          'Test re-takes a snapshot after any render or navigation.',
          'aria-ref values are never cached across interactions.',
          'Tests prefer stable selectors (role + name, data-testid) for assertions.',
        ]}
        gotcha={
          <>
            Agents copy an aria-ref from one step and use it six steps later. By then the DOM has
            re-rendered and the ref points at something else — or nothing.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-5 space-y-4" data-tick={tick}>
        <div className="flex gap-2 flex-wrap">
          {['Alpha', 'Bravo', 'Charlie', 'Delta'].map((label, i) => (
            <button
              key={ids[i] ?? i}
              aria-ref={ids[i]}
              data-ref={ids[i]}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
            >
              {label} <span className="text-muted-foreground font-mono text-xs ml-1">({ids[i]})</span>
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
