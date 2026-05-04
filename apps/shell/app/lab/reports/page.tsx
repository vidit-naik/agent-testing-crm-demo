'use client'

import { useMemo, useState } from 'react'
import { BarChart3, CalendarDays, Download, Filter, RefreshCw } from 'lucide-react'

const REPORTS = [
  { id: 'pipeline', label: 'Pipeline', value: '$3.8M', delta: '+12%', owner: 'Revenue' },
  { id: 'forecast', label: 'Forecast', value: '$1.4M', delta: '+6%', owner: 'Sales' },
  { id: 'renewals', label: 'Renewals', value: '$820K', delta: '-3%', owner: 'Success' },
  { id: 'activity', label: 'Activity', value: '1,248', delta: '+18%', owner: 'Operations' },
]

export default function ReportsPage() {
  const [range, setRange] = useState('quarter')
  const [owner, setOwner] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

  const filteredReports = useMemo(
    () => REPORTS.filter((report) => owner === 'All' || report.owner === owner),
    [owner]
  )

  const refresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setRefreshing(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Review revenue performance and pipeline health.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filters
          </div>
          <label className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="month">This month</option>
              <option value="quarter">This quarter</option>
              <option value="year">This year</option>
            </select>
          </label>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option>All</option>
            <option>Revenue</option>
            <option>Sales</option>
            <option>Success</option>
            <option>Operations</option>
          </select>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        {filteredReports.map((report) => (
          <section key={report.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{report.label}</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{report.value}</div>
            <div className={`mt-1 text-sm font-medium ${report.delta.startsWith('+') ? 'text-emerald-700' : 'text-amber-700'}`}>
              {report.delta}
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border bg-card overflow-hidden">
          <iframe
            title="Reports admin"
            src="/admin/"
            className="w-full h-[70vh] border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </section>
        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Report package</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Date range" value={range} />
              <Summary label="Owner" value={owner} />
              <Summary label="Rows loaded" value="10,000" />
              <Summary label="Last refresh" value={refreshing ? 'Refreshing' : 'Just now'} />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Saved views</h2>
            <div className="mt-3 space-y-2">
              {['Executive summary', 'Renewal risk', 'Owner scorecard'].map((view) => (
                <button key={view} type="button" className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent">
                  {view}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  )
}
