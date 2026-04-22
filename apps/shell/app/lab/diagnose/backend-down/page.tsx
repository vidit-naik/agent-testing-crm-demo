'use client'

import { useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

export default function BackendDownPage() {
  const [form, setForm] = useState({ title: '', value: '', stage: 'Proposal' })
  const [status, setStatus] = useState<'idle' | 'pending' | 'error' | 'saved'>('idle')
  const [lastStatus, setLastStatus] = useState<number | null>(null)
  const [reported, setReported] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('pending')
    try {
      const res = await fetch('/api/diagnose/backend-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setLastStatus(res.status)
      setStatus(res.ok ? 'saved' : 'error')
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
        detail: `Backend returns ${lastStatus ?? 504} on every save`,
      }),
    })
    setReported(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backend down"
        subtitle="Deal save endpoint always returns 504. Frontend is fine. This is an infra failure disguised as a form bug."
        route="/lab/diagnose/backend-down"
        patterns={['infra failure', 'classification', 'blocker report']}
      />

      <ScenarioPanel
        story={
          <>
            A rep tries to log a proposal-stage deal for an account. The form submits, but every
            POST returns <code className="font-mono text-xs">504 Gateway Timeout</code>. The UI
            renders correctly — the problem is the backend.
          </>
        }
        steps={[
          'Fill out the form below',
          'Click "Save deal"',
          'Observe the 504 error',
          'Classify the failure as a backend bug',
          'POST to /api/blocker with type="backend-bug"',
        ]}
        success={[
          'Test recognizes the 504 as infra failure, not test logic.',
          'Selectors are NOT rewritten in an attempt to "fix" the save.',
          'Timeout is NOT bumped past the default.',
          'A single /api/blocker report is filed with classification.',
        ]}
        gotcha={
          <>
            Agents often re-run with longer timeouts or try different selectors for the Save button.
            The button works fine. The backend itself is down. Exit fast.
          </>
        }
      />

      <form onSubmit={save} className="rounded-lg border bg-card p-5 space-y-4 max-w-xl">
        <h3 className="font-semibold">New deal</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ACME Q3 expansion"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Value (USD)</label>
            <input
              type="number"
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="50000"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stage</label>
            <select
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option>Prospecting</option>
              <option>Qualification</option>
              <option>Proposal</option>
              <option>Negotiation</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === 'pending'}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
            data-testid="save-deal"
          >
            {status === 'pending' ? 'Saving...' : 'Save deal'}
          </button>
          {lastStatus !== null && (
            <span
              className={`text-sm font-medium ${
                status === 'error' ? 'text-destructive' : 'text-emerald-700'
              }`}
              data-last-status={lastStatus}
            >
              HTTP {lastStatus} · {status === 'error' ? 'backend refused' : 'ok'}
            </span>
          )}
        </div>
      </form>

      {status === 'error' && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 space-y-3 max-w-xl">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-700 mb-1">
              Infra failure detected
            </div>
            <p className="text-sm text-rose-900">
              <code className="font-mono text-xs">POST /api/diagnose/backend-down → {lastStatus}</code>.
              This isn&apos;t a test or UI bug. The correct action is to classify and report, not to
              retry with different selectors.
            </p>
          </div>
          <button
            onClick={reportBlocker}
            disabled={reported}
            className="rounded-md bg-rose-600 text-white px-3 py-1.5 text-sm font-medium disabled:opacity-60"
            data-testid="blocker-report"
          >
            {reported ? '✓ Reported to /api/blocker' : 'Report blocker'}
          </button>
        </div>
      )}
    </div>
  )
}
