'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { BarChart3, CalendarClock, Mail, Plus, Search, Users } from 'lucide-react'

type Campaign = {
  id: string
  name: string
  status: 'Active' | 'Draft' | 'Paused' | 'Scheduled'
  sent: number
  opened: number
  clicked: number
  channel: 'Email' | 'In-app' | 'Email + In-app'
  owner: string
  audience: string
  nextSend: string
}

const CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Q3 renewal nudge', status: 'Active', sent: 842, opened: 58, clicked: 14, channel: 'Email', owner: 'Maya Patel', audience: 'Renewals due 30d', nextSend: 'Today 2:00 PM' },
  { id: 'c2', name: 'Winback inactive 60d', status: 'Draft', sent: 0, opened: 0, clicked: 0, channel: 'Email', owner: 'Jon Bell', audience: 'Inactive accounts', nextSend: 'Not scheduled' },
  { id: 'c3', name: 'Product tour', status: 'Active', sent: 2104, opened: 71, clicked: 22, channel: 'In-app', owner: 'Priya Raman', audience: 'New signups', nextSend: 'Rolling' },
  { id: 'c4', name: 'Enterprise whitepaper', status: 'Paused', sent: 310, opened: 44, clicked: 9, channel: 'Email', owner: 'Nora Quinn', audience: 'Enterprise leads', nextSend: 'Paused' },
  { id: 'c5', name: 'Healthcare webinar invite', status: 'Scheduled', sent: 0, opened: 0, clicked: 0, channel: 'Email + In-app', owner: 'Maya Patel', audience: 'Healthcare pipeline', nextSend: 'May 7 9:00 AM' },
]

const STATUSES = ['All', 'Active', 'Scheduled', 'Draft', 'Paused'] as const

export default function CampaignsIndex() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All')
  const [selectedId, setSelectedId] = useState(CAMPAIGNS[0].id)

  const filtered = useMemo(
    () =>
      CAMPAIGNS.filter((campaign) => {
        const matchesStatus = status === 'All' || campaign.status === status
        const text = `${campaign.name} ${campaign.owner} ${campaign.audience} ${campaign.channel}`.toLowerCase()
        return matchesStatus && text.includes(query.toLowerCase())
      }),
    [query, status]
  )

  const selected = CAMPAIGNS.find((campaign) => campaign.id === selectedId) || filtered[0] || CAMPAIGNS[0]
  const activeCount = CAMPAIGNS.filter((campaign) => campaign.status === 'Active').length
  const scheduledCount = CAMPAIGNS.filter((campaign) => campaign.status === 'Scheduled').length
  const totalAudience = CAMPAIGNS.reduce((sum, campaign) => sum + campaign.sent, 0)
  const avgOpen = Math.round(
    CAMPAIGNS.filter((campaign) => campaign.sent > 0).reduce((sum, campaign) => sum + campaign.opened, 0) /
      CAMPAIGNS.filter((campaign) => campaign.sent > 0).length
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Plan, launch, and monitor customer messaging.</p>
        </div>
        <Link
          href="/lab/campaigns/new/details"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          New campaign
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Active" value={String(activeCount)} icon={Mail} />
        <Metric label="Scheduled" value={String(scheduledCount)} icon={CalendarClock} />
        <Metric label="Audience reached" value={totalAudience.toLocaleString()} icon={Users} />
        <Metric label="Avg open rate" value={`${avgOpen}%`} icon={BarChart3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <div className="relative min-w-64 flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search campaigns"
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="flex rounded-md border bg-background p-1">
              {STATUSES.map((nextStatus) => (
                <button
                  key={nextStatus}
                  type="button"
                  onClick={() => setStatus(nextStatus)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${
                    status === nextStatus ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                >
                  {nextStatus}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Channel</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sent</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Click</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((campaign) => (
                  <tr
                    key={campaign.id}
                    onClick={() => setSelectedId(campaign.id)}
                    className={`cursor-pointer hover:bg-accent/50 ${selected.id === campaign.id ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">{campaign.owner}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{campaign.channel}</td>
                    <td className="px-4 py-3 text-right">{campaign.sent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{campaign.opened}%</td>
                    <td className="px-4 py-3 text-right">{campaign.clicked}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">{selected.audience}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <Detail label="Owner" value={selected.owner} />
              <Detail label="Channel" value={selected.channel} />
              <Detail label="Next send" value={selected.nextSend} />
              <Detail label="Open rate" value={`${selected.opened}%`} />
              <Detail label="Click rate" value={`${selected.clicked}%`} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">
                Duplicate
              </button>
              <button type="button" className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">
                Archive
              </button>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Performance</h2>
            <div className="mt-4 space-y-3">
              <Progress label="Open" value={selected.opened} />
              <Progress label="Click" value={selected.clicked} />
              <Progress label="Reply" value={Math.max(0, Math.round(selected.clicked / 2))} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const classes =
    status === 'Active'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'Paused'
      ? 'bg-amber-100 text-amber-800'
      : status === 'Scheduled'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-slate-100 text-slate-700'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>{status}</span>
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  )
}
