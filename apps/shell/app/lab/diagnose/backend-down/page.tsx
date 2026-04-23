'use client'

import { useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function NewDealPage() {
  const [form, setForm] = useState({ title: '', value: '', stage: 'Proposal', account: '' })
  const [status, setStatus] = useState<'idle' | 'pending' | 'error' | 'saved'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryAt, setRetryAt] = useState<number | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('pending')
    setErrorMessage(null)
    try {
      const res = await fetch('/api/diagnose/backend-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('saved')
      } else {
        setStatus('error')
        setErrorMessage(`Could not save deal. Our API returned ${res.status}. Support has been notified.`)
        setRetryAt(Date.now())
      }
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold">New deal</h1>
        <p className="text-muted-foreground">Log a new sales opportunity.</p>
      </div>

      <form onSubmit={save} className="rounded-lg border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Deal title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ACME Q3 expansion"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Account</label>
          <input
            type="text"
            required
            value={form.account}
            onChange={(e) => setForm({ ...form, account: e.target.value })}
            placeholder="ACME Corp"
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

        {errorMessage && (
          <div
            className="rounded-md border border-rose-200 bg-rose-50 p-3 flex items-start gap-2"
            role="alert"
            data-error="true"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-rose-900 flex-1">
              <div className="font-medium">Save failed</div>
              <p className="text-rose-800">{errorMessage}</p>
              {retryAt && (
                <p className="text-xs text-rose-700 mt-1">
                  Last attempt: {new Date(retryAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}

        {status === 'saved' && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Deal saved.
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={status === 'pending'}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
            data-testid="save-deal"
          >
            {status === 'pending' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save deal'
            )}
          </button>
          <button
            type="button"
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
