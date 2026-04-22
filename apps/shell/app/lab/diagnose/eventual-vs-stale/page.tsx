'use client'

import { useCallback, useEffect, useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

export default function EventualVsStalePage() {
  const [items, setItems] = useState<string[]>([])
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const [broken, setBroken] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    setBroken(
      typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('broken') === '1'
    )
  }, [])

  const load = useCallback(async () => {
    const res = await fetch('/api/diagnose/eventual' + (broken ? '?broken=1' : ''))
    const data = await res.json()
    setItems(data.entities || [])
  }, [broken])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    const name = `Task-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    setLastSubmitted(name)
    setPolling(true)
    setElapsed(0)
    const start = Date.now()

    await fetch('/api/diagnose/eventual' + (broken ? '?broken=1' : ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    const poll = setInterval(async () => {
      await load()
      setElapsed(Math.floor((Date.now() - start) / 100) / 10)
    }, 400)

    const stop = setTimeout(() => {
      clearInterval(poll)
      setPolling(false)
    }, 10000)

    return () => {
      clearInterval(poll)
      clearTimeout(stop)
    }
  }

  const appears = lastSubmitted && items.includes(lastSubmitted)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventual vs stale"
        subtitle='Create a task. It settles in ~2.5s. "broken=1" means it never settles — that&apos;s a real bug.'
        route="/lab/diagnose/eventual-vs-stale"
        patterns={['eventual consistency', 'polling', 'bug vs delay']}
      />

      <ScenarioPanel
        story={
          <>
            A new task is created. The write goes through immediately, but the read API caches for
            2.5s ± 500ms before the new task appears in the list. In <code className="font-mono text-xs">broken=1</code>{' '}
            mode the task never appears — that&apos;s a genuine data-loss bug.
          </>
        }
        steps={[
          'Click "Create task"',
          'Poll the list via the Refresh button or watch the counter',
          'In normal mode: task appears within ~2.5s ± 500ms',
          'In ?broken=1 mode: task never appears → that is a real bug',
          'Classify correctly before reporting',
        ]}
        success={[
          <>
            Normal: test uses <code className="font-mono text-xs">expect.poll()</code> up to ~4s and
            does NOT flag as a bug.
          </>,
          <>
            Broken: test times out, reports <code className="font-mono text-xs">type=&quot;app-bug&quot;</code>{' '}
            with evidence the write didn&apos;t land.
          </>,
          'Test distinguishes the two modes purely from observed timing.',
        ]}
        gotcha={
          <>
            Agents often treat both modes identically — either by waiting forever on the broken one
            or by flagging the normal one as broken after ~1s.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide">Mode:</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              broken ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}
            data-mode={broken ? 'broken' : 'eventual'}
          >
            {broken ? 'broken — writes never settle' : 'eventual — settles in ~2.5s'}
          </span>
          <a
            href={broken ? '?' : '?broken=1'}
            className="text-xs text-primary underline ml-auto"
          >
            Switch to {broken ? 'eventual' : 'broken'} mode
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={polling}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
            data-testid="create-task"
          >
            {polling ? 'Polling...' : 'Create task'}
          </button>
          <button
            onClick={load}
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Refresh list
          </button>
          {polling && (
            <span className="text-xs text-muted-foreground font-mono">
              elapsed {elapsed.toFixed(1)}s
            </span>
          )}
        </div>

        {lastSubmitted && (
          <div
            className={`rounded-md border p-3 text-sm ${
              appears
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
            data-last-submitted={lastSubmitted}
            data-appears={appears ? 'true' : 'false'}
          >
            Last submitted: <code className="font-mono text-xs">{lastSubmitted}</code> —{' '}
            <strong>{appears ? 'visible in list' : 'pending'}</strong>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Current items
          </h4>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="rounded-md border divide-y">
              {items.map((it) => (
                <li key={it} data-item={it} className="px-3 py-2 text-sm font-mono">
                  {it}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
