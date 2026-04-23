'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, RotateCcw } from 'lucide-react'

export default function SessionLimitPage() {
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
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold">Secure workspace</h1>
        <p className="text-muted-foreground">
          High-sensitivity area. Session limits apply.
        </p>
      </div>

      {blocked ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-6 space-y-3" data-blocked="true">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
            <h2 className="text-lg font-semibold text-rose-900">Session limit reached</h2>
          </div>
          <p className="text-sm text-rose-900">
            You&apos;ve opened this workspace in {pageCount} browser sessions. To protect customer
            data, only 2 active sessions are allowed per user.
          </p>
          <p className="text-sm text-rose-900">
            Close other tabs with this page open, or reset below.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-rose-600 text-white px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            Reset session counter
          </button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6 space-y-3" data-blocked="false">
          <h2 className="font-semibold">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            You have {Math.max(0, 2 - pageCount)} additional session
            {2 - pageCount === 1 ? '' : 's'} available.
          </p>
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Sessions this device
            </div>
            <div className="text-2xl font-bold">{pageCount} / 2</div>
          </div>
        </div>
      )}
    </div>
  )
}
