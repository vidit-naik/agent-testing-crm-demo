'use client'

import { useEffect, useState } from 'react'

export default function RuntimeCrashPage() {
  const [loaded, setLoaded] = useState(false)
  const [crashed, setCrashed] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoaded(true)
      // Inject synthetic runtime error after ~1.2s — mirrors post-nav crash.
      setTimeout(() => {
        try {
          const err = new Error('Synthetic TypeError: cannot read properties of undefined (reading "id")')
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
        detail: 'Synthetic runtime crash detected',
      }),
    }).catch(() => {})
    setReported(true)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Runtime crash</h1>
        <p className="text-muted-foreground">
          Page initializes, then injects a synthetic runtime error after ~1.2s.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <p className="text-sm">
          Load state: <strong>{loaded ? 'loaded' : 'loading'}</strong>
        </p>
        {crashed && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            Synthetic crash dispatched. Agent should classify as <code>app-bug</code> and POST /api/blocker.
          </div>
        )}
        <button
          onClick={reportBlocker}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
        >
          {reported ? '✓ Reported' : 'Report to /api/blocker'}
        </button>
      </div>
    </div>
  )
}
