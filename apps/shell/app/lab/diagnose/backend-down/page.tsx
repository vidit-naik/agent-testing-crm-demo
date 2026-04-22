'use client'

import { useState } from 'react'

export default function BackendDownPage() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'error'>('idle')
  const [lastStatus, setLastStatus] = useState<number | null>(null)

  const save = async () => {
    setStatus('pending')
    try {
      const res = await fetch('/api/diagnose/backend-down', { method: 'POST' })
      setLastStatus(res.status)
      setStatus(res.ok ? 'idle' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const reportBlocker = async () => {
    await fetch('/api/blocker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'backend-bug',
        page: '/lab/diagnose/backend-down',
        detail: `Backend returns ${lastStatus ?? '504'}`,
      }),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Backend down</h1>
        <p className="text-muted-foreground">
          Mock wizard with an always-504 save. Test should classify infra failure, not rewrite selectors.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <p className="text-sm">Click Save. Backend always 504s.</p>
        <button
          onClick={save}
          disabled={status === 'pending'}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {status === 'pending' ? 'Saving...' : 'Save'}
        </button>
        {lastStatus !== null && (
          <p className="text-sm">
            Last response: <code>{lastStatus}</code>
          </p>
        )}
        <button
          onClick={reportBlocker}
          className="rounded-md border px-3 py-1.5 text-sm font-medium"
        >
          Report to /api/blocker
        </button>
      </div>
    </div>
  )
}
