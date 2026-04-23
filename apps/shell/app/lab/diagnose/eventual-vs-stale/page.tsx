'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, CheckSquare, RefreshCw } from 'lucide-react'

export default function TaskListPage() {
  const [items, setItems] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [broken, setBroken] = useState(false)

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setCreating(true)

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

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary" />
            Tasks
          </h1>
          <p className="text-muted-foreground">Track follow-ups for your accounts.</p>
        </div>
        <button
          onClick={load}
          className="rounded-md border border-input px-3 py-1.5 text-sm inline-flex items-center gap-1.5 hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <form onSubmit={submit} className="rounded-lg border bg-card p-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-testid="task-input"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
          data-testid="add-task"
        >
          <Plus className="h-4 w-4" />
          {creating ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div className="rounded-lg border bg-card">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">No tasks yet.</p>
        ) : (
          <ul className="divide-y">
            {items.map((t) => (
              <li key={t} className="px-4 py-2.5 text-sm flex items-center gap-2" data-task={t}>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
