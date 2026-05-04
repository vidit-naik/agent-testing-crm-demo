'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, RefreshCw, Server } from 'lucide-react'

export default function NewDealPage() {
  const [form, setForm] = useState({ title: '', value: '', stage: 'Proposal', account: '' })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'failed'>('idle')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/diagnose/backend-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('saved')
        setForm({ title: '', value: '', stage: 'Proposal', account: '' })
      } else {
        setStatus('failed')
      }
    } catch {
      setStatus('failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">New deal</h1>
        <p className="text-muted-foreground">Create and submit a sales opportunity.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={save} className="rounded-lg border bg-card p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium">Deal title</span>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="ACME Q3 expansion"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block font-medium">Account</span>
              <input
                type="text"
                required
                value={form.account}
                onChange={(e) => setForm({ ...form, account: e.target.value })}
                placeholder="ACME Corp"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Value</span>
              <input
                type="number"
                required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="50000"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Stage</span>
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
            </label>
          </div>

          {status === 'saved' && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Deal saved.
            </div>
          )}
          {status === 'failed' && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              Deal could not be saved. The service team has been notified.
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save deal'}
            </button>
            <button type="button" className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Service status</h2>
            </div>
            <div className="space-y-3 text-sm">
              <StatusRow label="Deal service" state={status === 'failed' ? 'Degraded' : 'Available'} />
              <StatusRow label="Queue" state="Available" />
              <StatusRow label="Notifications" state="Available" />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Draft summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Account" value={form.account || '-'} />
              <Summary label="Value" value={form.value ? `$${Number(form.value).toLocaleString()}` : '-'} />
              <Summary label="Stage" value={form.stage} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function StatusRow({ label, state }: { label: string; state: string }) {
  const bad = state === 'Degraded'
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`inline-flex items-center gap-1 font-medium ${bad ? 'text-amber-700' : 'text-emerald-700'}`}>
        {bad ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        {state}
      </span>
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
