'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

export default function SecureWorkspacePage() {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('crm-newpage-count')
      const n = raw ? parseInt(raw, 10) : 0
      const next = Number.isFinite(n) ? n + 1 : 1
      sessionStorage.setItem('crm-newpage-count', String(next))
      setBlocked(next > 2)
    } catch {}
  }, [])

  if (blocked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-lg border bg-card p-8 text-center max-w-sm">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-semibold mb-1">Workspace unavailable</h2>
          <p className="text-sm text-muted-foreground">
            This workspace is temporarily unavailable. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Secure workspace</h1>
        <p className="text-muted-foreground">
          Controlled-access area for sensitive customer records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Restricted records', value: 128, note: 'PII + financials' },
          { label: 'Active sessions', value: 1, note: '2 session limit' },
          { label: 'Audit events (7d)', value: 412, note: 'SIEM enabled' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</div>
            <div className="text-3xl font-bold mt-1">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.note}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h3 className="font-semibold text-sm mb-3">Recent access</h3>
        <ul className="divide-y text-sm">
          {[
            { who: 'Alice Chen', what: 'Viewed contract-2024-Q4.pdf', when: '2 min ago' },
            { who: 'Bob Smith', what: 'Exported pricing-acme.pdf', when: '14 min ago' },
            { who: 'Dan Rivera', what: 'Viewed audit log', when: '1 hr ago' },
          ].map((r) => (
            <li key={r.when} className="py-2 flex justify-between">
              <span>
                <strong>{r.who}</strong> — {r.what}
              </span>
              <span className="text-muted-foreground text-xs">{r.when}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
