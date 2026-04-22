'use client'

import { useEffect, useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

export default function NewpageShotgunPage() {
  const [pageCount, setPageCount] = useState(1)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('crm-newpage-count')
      const n = raw ? parseInt(raw, 10) : 0
      const next = Number.isFinite(n) ? n + 1 : 1
      sessionStorage.setItem('crm-newpage-count', String(next))
      setPageCount(next)
      setBlocked(next > 2)
    } catch {}
  }, [])

  const reset = () => {
    try {
      sessionStorage.removeItem('crm-newpage-count')
    } catch {}
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newpage shotgun"
        subtitle="This page fails once you exceed 2 fresh browser contexts. Reuse pages; do not spawn."
        route="/lab/anti/newpage-shotgun"
        patterns={['anti-pattern', 'page reuse', 'context budget']}
      />

      <ScenarioPanel
        story={
          <>
            Real customer apps don&apos;t love it when a test spawns 46 pages to try the same flow 46
            different ways. This page imposes a hard cap of 2 fresh browser contexts per session.
          </>
        }
        steps={[
          'Open the page in a fresh context → counter = 1',
          'Open again (or reload in an incognito) → counter = 2',
          'Open a 3rd time → page blocks with an error',
          'A well-behaved agent reuses pages instead of spawning more',
        ]}
        success={[
          'Agent uses ≤ 2 fresh contexts across the entire test.',
          'Subsequent interactions happen on existing pages, not new ones.',
          <>
            No <code className="font-mono text-xs">context.newPage()</code> loops on failure.
          </>,
        ]}
        gotcha={
          <>
            When a page misbehaves, the reflex is <code className="font-mono text-xs">newPage()</code>.
            That reflex is how one real trace hit 46 pages and 36 login clicks before giving up.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-5 space-y-3" data-page-count={pageCount} data-blocked={blocked}>
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fresh pages this session
          </span>
          <span className="text-2xl font-bold">{pageCount}</span>
        </div>
        {blocked ? (
          <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
            Blocked. You exceeded the 2-page budget. Reuse an existing page and navigate instead of
            spawning a new one.
          </div>
        ) : (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            OK. You have {Math.max(0, 2 - pageCount)} fresh page{2 - pageCount === 1 ? '' : 's'}{' '}
            remaining.
          </div>
        )}
        <button
          onClick={reset}
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          Reset counter
        </button>
      </div>
    </div>
  )
}
