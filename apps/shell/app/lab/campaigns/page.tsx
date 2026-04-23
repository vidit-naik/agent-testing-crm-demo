'use client'

import Link from 'next/link'
import { Plus, Mail, Users, BarChart3 } from 'lucide-react'

const CAMPAIGNS = [
  { id: 'c1', name: 'Q3 renewal nudge', status: 'Active', sent: 842, opened: 58, channel: 'Email' },
  { id: 'c2', name: 'Winback inactive 60d', status: 'Draft', sent: 0, opened: 0, channel: 'Email' },
  { id: 'c3', name: 'Product tour (new signups)', status: 'Active', sent: 2104, opened: 71, channel: 'In-app' },
  { id: 'c4', name: 'Enterprise whitepaper', status: 'Paused', sent: 310, opened: 44, channel: 'Email' },
]

export default function CampaignsIndex() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Reach customers with targeted messages.</p>
        </div>
        <Link
          href="/lab/campaigns/new/details"
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
          data-testid="new-campaign"
        >
          <Plus className="h-4 w-4" />
          New campaign
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Active campaigns', value: 2, icon: Mail },
          { label: 'Audience (30d)', value: '3,256', icon: Users },
          { label: 'Avg open rate', value: '58%', icon: BarChart3 },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {s.label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">Channel</th>
              <th className="px-4 py-2.5 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">Sent</th>
              <th className="px-4 py-2.5 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {CAMPAIGNS.map((c) => (
              <tr key={c.id} data-campaign={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Paused'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.channel}</td>
                <td className="px-4 py-3 text-right">{c.sent.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{c.opened}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
