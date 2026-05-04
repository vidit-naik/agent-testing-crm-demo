'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckSquare, Clock, Plus, RefreshCw } from 'lucide-react'

type Task = { name: string; owner: string; priority: string; synced: boolean }

export default function TaskListPage() {
  const [items, setItems] = useState<string[]>([])
  const [localItems, setLocalItems] = useState<Task[]>([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [broken, setBroken] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<number | null>(null)

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
    setLocalItems((current) =>
      current.map((task) =>
        (data.entities || []).includes(task.name) ? { ...task, synced: true } : task
      )
    )
    setLastRefresh(Date.now())
  }, [broken])

  useEffect(() => {
    load()
  }, [load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    setLocalItems((current) => [...current, { name, owner: 'Alice Chen', priority: 'Medium', synced: false }])

    try {
      await fetch('/api/diagnose/eventual' + (broken ? '?broken=1' : ''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const start = Date.now()
      const poll = setInterval(async () => {
        await load()
        if (Date.now() - start > 8000) {
          clearInterval(poll)
          setCreating(false)
        }
      }, 400)
      setNewName('')
    } catch {
      setCreating(false)
    }
  }

  const combined = useMemo(() => {
    const remote = items.map((name) => ({ name, owner: 'System', priority: 'Medium', synced: true }))
    const pending = localItems.filter((task) => !items.includes(task.name))
    return [...pending, ...remote]
  }, [items, localItems])

  const pending = combined.filter((task) => !task.synced).length

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <CheckSquare className="h-7 w-7 text-primary" />
            Tasks
          </h1>
          <p className="text-muted-foreground">Track follow-ups for accounts and opportunities.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <form onSubmit={submit} className="flex gap-2 rounded-lg border bg-card p-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add a task"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Adding...' : 'Add'}
            </button>
          </form>

          <section className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <h2 className="font-semibold">Task queue</h2>
              <p className="text-sm text-muted-foreground">{combined.length} tasks · {pending} pending sync</p>
            </div>
            {combined.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No tasks yet.</p>
            ) : (
              <ul className="divide-y">
                {combined.map((task) => (
                  <li key={task.name} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[minmax(0,1fr)_120px_120px] md:items-center">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{task.name}</span>
                    </div>
                    <span className="text-muted-foreground">{task.owner}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.synced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.synced ? 'Synced' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Sync status</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Pending" value={String(pending)} />
              <Summary label="Remote tasks" value={String(items.length)} />
              <Summary label="Last refresh" value={lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : '-'} />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Queue timing</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Newly created work can appear as pending while background sync completes.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
