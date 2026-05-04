'use client'

import { useEffect, useState } from 'react'
import { KeyRound, ShieldCheck, UserCheck } from 'lucide-react'

export default function SecureWorkspacePage() {
  const [blocked, setBlocked] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="mb-1 font-semibold">Workspace unavailable</h2>
          <p className="text-sm text-muted-foreground">The current session reached its workspace access limit.</p>
          <button
            type="button"
            onClick={() => setRequestSent(true)}
            className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Request access
          </button>
          {requestSent && (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Access request sent.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Secure workspace</h1>
        <p className="text-muted-foreground">Controlled access for sensitive customer records.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Restricted records" value="128" note="Contracts and financials" icon={ShieldCheck} />
        <Metric label="Active sessions" value="1" note="Session controls enabled" icon={UserCheck} />
        <Metric label="Access requests" value={requestSent ? '1' : '0'} note="Pending approval" icon={KeyRound} />
      </div>

      <section className="rounded-lg border bg-card p-5">
        <h2 className="mb-3 font-semibold">Recent access</h2>
        <ul className="divide-y text-sm">
          {[
            { who: 'Alice Chen', what: 'Viewed contract-2024-Q4.pdf', when: '2 min ago' },
            { who: 'Bob Smith', what: 'Exported pricing-acme.pdf', when: '14 min ago' },
            { who: 'Dan Rivera', what: 'Viewed audit log', when: '1 hr ago' },
          ].map((row) => (
            <li key={row.when} className="flex justify-between gap-3 py-3">
              <span><strong>{row.who}</strong> · {row.what}</span>
              <span className="text-xs text-muted-foreground">{row.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Metric({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: any }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{note}</div>
    </div>
  )
}
