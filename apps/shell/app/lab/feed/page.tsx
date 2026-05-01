'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ClipboardList, Edit3, RefreshCw, Sparkles, X } from 'lucide-react'

type Line = { id: number; text: string }
type Source = 'Accounts' | 'Opportunities' | 'Cases' | 'Tasks'
type ActionItem = {
  id: string
  title: string
  owner: string
  due: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'open' | 'approved' | 'dismissed' | 'task'
}

const SOURCES: Source[] = ['Accounts', 'Opportunities', 'Cases', 'Tasks']

const INITIAL_ACTIONS: ActionItem[] = [
  { id: 'a1', title: 'Schedule renewal call with Globex', owner: 'Bob Smith', due: 'Friday', priority: 'High', status: 'open' },
  { id: 'a2', title: 'Review stalled Initech proposal', owner: 'Carol Ng', due: 'Tomorrow', priority: 'High', status: 'open' },
  { id: 'a3', title: 'Send ACME implementation recap', owner: 'Alice Chen', due: 'Next week', priority: 'Medium', status: 'open' },
]

export default function FeedPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle')
  const [summary, setSummary] = useState('')
  const [sources, setSources] = useState<Source[]>(['Accounts', 'Opportunities'])
  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines])

  const finalText = useMemo(() => {
    const sourceText = sources.join(', ').toLowerCase()
    return `5 records need attention across ${sourceText}. Two renewals are due this week, one proposal has stalled, and three accounts have new executive activity.`
  }, [sources])

  const toggleSource = (source: Source) => {
    setSources((current) =>
      current.includes(source)
        ? current.filter((item) => item !== source)
        : [...current, source]
    )
  }

  const start = () => {
    setLines([])
    setSummary('')
    setStatus('streaming')
    setActions(INITIAL_ACTIONS)
    let counter = 0
    const params = new URLSearchParams({ sources: sources.join(',') })
    const es = new EventSource(`/api/feed/stream?${params.toString()}`)
    es.onmessage = (event) => {
      counter += 1
      setLines((prev) => [...prev, { id: counter, text: event.data }])
    }
    es.addEventListener('done', () => {
      setSummary(finalText)
      setStatus('done')
      es.close()
    })
    es.onerror = () => {
      setStatus('error')
      es.close()
    }
  }

  const updateAction = (id: string, patch: Partial<ActionItem>) => {
    setActions((current) =>
      current.map((action) => (action.id === id ? { ...action, ...patch } : action))
    )
  }

  const beginEdit = (action: ActionItem) => {
    setEditingId(action.id)
    setDraftTitle(action.title)
  }

  const saveEdit = (id: string) => {
    updateAction(id, { title: draftTitle })
    setEditingId(null)
  }

  const openActions = actions.filter((action) => action.status === 'open').length
  const taskCount = actions.filter((action) => action.status === 'task').length

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Sparkles className="h-7 w-7 text-primary" />
            Activity digest
          </h1>
          <p className="text-muted-foreground">Summarize recent customer and pipeline activity.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              status === 'streaming'
                ? 'bg-amber-500 animate-pulse'
                : status === 'done'
                ? 'bg-emerald-500'
                : status === 'error'
                ? 'bg-rose-500'
                : 'bg-slate-400'
            }`}
          />
          <span className="text-xs font-medium" data-stream-status={status}>
            {status === 'idle' ? 'Ready' : status === 'streaming' ? 'Running' : status === 'done' ? 'Complete' : 'Error'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              {SOURCES.map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleSource(source)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium ${
                    sources.includes(source)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {source}
                </button>
              ))}
              <button
                onClick={start}
                disabled={status === 'streaming' || sources.length === 0}
                className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {status === 'streaming' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate digest
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 space-y-4">
            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto rounded-md border bg-slate-950 p-4 font-mono text-xs text-slate-100"
            >
              {lines.length === 0 ? (
                <span className="text-slate-500">No digest generated yet.</span>
              ) : (
                <div className="space-y-1">
                  {lines.map((line) => (
                    <div key={line.id} data-feed-line={line.id} className="flex gap-2">
                      <span className="text-slate-500">{String(line.id).padStart(2, '0')}</span>
                      <span>{line.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {summary && (
              <div
                id="final-summary"
                data-summary-ready="true"
                className="rounded-md border border-primary/30 bg-primary/5 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Digest
                  </span>
                  <button
                    type="button"
                    onClick={() => setSummary('')}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}
          </section>

          <section className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Recommended actions</h2>
              <span className="text-sm text-muted-foreground">{openActions} open</span>
            </div>
            <div className="divide-y">
              {actions.map((action) => (
                <div key={action.id} className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      {editingId === action.id ? (
                        <input
                          value={draftTitle}
                          onChange={(event) => setDraftTitle(event.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      ) : (
                        <div className="font-medium">{action.title}</div>
                      )}
                      <div className="mt-1 text-sm text-muted-foreground">
                        {action.owner} · {action.due} · {action.priority}
                      </div>
                    </div>
                    <ActionStatus status={action.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editingId === action.id ? (
                      <button
                        type="button"
                        onClick={() => saveEdit(action.id)}
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => beginEdit(action)}
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => updateAction(action.id, { status: 'approved' })}
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAction(action.id, { status: 'task' })}
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Create task
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAction(action.id, { status: 'dismissed' })}
                      className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Digest scope</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Detail label="Sources" value={sources.length.toString()} />
              <Detail label="Status" value={status} />
              <Detail label="Tasks created" value={taskCount.toString()} />
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Priority mix</h2>
            <div className="mt-4 space-y-3">
              <PriorityBar label="High" value={actions.filter((action) => action.priority === 'High').length} total={actions.length} />
              <PriorityBar label="Medium" value={actions.filter((action) => action.priority === 'Medium').length} total={actions.length} />
              <PriorityBar label="Low" value={actions.filter((action) => action.priority === 'Low').length} total={actions.length} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function ActionStatus({ status }: { status: ActionItem['status'] }) {
  const styles =
    status === 'approved'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'dismissed'
      ? 'bg-slate-100 text-slate-700'
      : status === 'task'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-amber-100 text-amber-800'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}>{status}</span>
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  )
}

function PriorityBar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
