'use client'

import { useEffect, useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

export default function RuntimeCrashPage() {
  const [loaded, setLoaded] = useState(false)
  const [crashed, setCrashed] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoaded(true)
      setTimeout(() => {
        try {
          const err = new Error(
            'Synthetic TypeError: Cannot read properties of undefined (reading "id")'
          )
          window.dispatchEvent(new ErrorEvent('error', { error: err, message: err.message }))
          setCrashed(true)
        } catch {}
      }, 1200)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  const reportBlocker = async () => {
    await fetch('/api/blocker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'app-bug',
        page: '/lab/diagnose/runtime-crash',
        detail: 'Synthetic TypeError dispatched ~1.2s after navigation',
      }),
    })
    setReported(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Runtime crash"
        subtitle="Contact detail loads fine, then throws a TypeError after initial render. This is an app bug — no test can save it."
        route="/lab/diagnose/runtime-crash"
        patterns={['app bug', 'post-nav crash', 'blocker report']}
      />

      <ScenarioPanel
        story={
          <>
            A user navigates to the page. It loads. About 1.2 seconds later an unhandled
            <code className="font-mono text-xs mx-1">TypeError</code> fires in the console and the
            interactive part of the page stops working.
          </>
        }
        steps={[
          'Wait for the page to mount',
          'Observe the crash notice appear after ~1s',
          'Classify: this is an app bug, not a test bug',
          'POST /api/blocker with type="app-bug"',
          'Stop — do not retry selectors',
        ]}
        success={[
          <>
            Crash is detected via <code className="font-mono text-xs">window.onerror</code> or page
            state <code className="font-mono text-xs">data-crashed</code>.
          </>,
          'Classification is app-bug (UI threw), not test-bug or backend-bug.',
          'No selector-healing attempts are made.',
          'Blocker endpoint receives exactly one report.',
        ]}
        gotcha={
          <>
            Naive healers keep trying <code className="font-mono text-xs">page.click()</code> and
            blame the selectors. The DOM is fine — the React tree is dead. Bail.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-5 space-y-4" data-crashed={crashed}>
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              !loaded ? 'bg-slate-400' : crashed ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-sm font-medium" data-page-state={crashed ? 'crashed' : loaded ? 'loaded' : 'loading'}>
            {!loaded ? 'Loading...' : crashed ? 'Crashed' : 'Loaded — awaiting crash...'}
          </span>
        </div>

        <div className="rounded-md bg-slate-50 p-4 border text-sm">
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Simulated contact detail
          </div>
          <dl className="grid grid-cols-[120px,1fr] gap-y-1 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd>Jane Smith</dd>
            <dt className="text-muted-foreground">Title</dt>
            <dd>VP Operations</dd>
            <dt className="text-muted-foreground">Account</dt>
            <dd>ACME Corp</dd>
          </dl>
        </div>

        {crashed && (
          <div className="rounded-md border border-rose-300 bg-rose-50 p-4 space-y-2">
            <div className="text-xs font-semibold uppercase text-rose-700">Console error</div>
            <pre className="text-xs text-rose-900 font-mono whitespace-pre-wrap">
TypeError: Cannot read properties of undefined (reading &quot;id&quot;)
    at ContactDetail (contact.tsx:42:18)
            </pre>
            <button
              onClick={reportBlocker}
              disabled={reported}
              className="rounded-md bg-rose-600 text-white px-3 py-1.5 text-sm font-medium disabled:opacity-60"
              data-testid="blocker-report"
            >
              {reported ? '✓ Reported' : 'Report blocker'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
