'use client'

import { useEffect, useState } from 'react'

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
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Newpage shotgun</h1>
        <p className="text-muted-foreground">
          Every fresh <code>context.newPage()</code> past 2 fails.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <p className="text-sm">
          Pages opened this session: <strong>{pageCount}</strong>
        </p>
        {blocked ? (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            Blocked. Agent should reuse existing pages rather than spawning more.
          </div>
        ) : (
          <p className="text-sm text-emerald-700">Page loaded successfully.</p>
        )}
        <button
          onClick={reset}
          className="rounded-md border px-3 py-1.5 text-sm font-medium"
        >
          Reset counter
        </button>
      </div>
    </div>
  )
}
