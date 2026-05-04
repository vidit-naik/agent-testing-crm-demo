'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ExternalLink, Lock, Server, ShieldAlert, Users } from 'lucide-react'

const MODULES = [
  { id: 'users', label: 'Users', count: 128, status: 'Healthy', icon: Users },
  { id: 'roles', label: 'Roles', count: 12, status: 'Review', icon: Lock },
  { id: 'systems', label: 'Systems', count: 7, status: 'Healthy', icon: Server },
  { id: 'alerts', label: 'Alerts', count: 4, status: 'Open', icon: ShieldAlert },
]

export default function LegacyAdminPage() {
  const [selected, setSelected] = useState(MODULES[0].id)
  const active = MODULES.find((module) => module.id === selected) || MODULES[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Admin console</h1>
          <p className="text-muted-foreground">Manage users, roles, system settings, and security alerts.</p>
        </div>
        <Link
          href="/legacy/admin/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Open console
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {MODULES.map((module) => {
          const Icon = module.icon
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => setSelected(module.id)}
              className={`rounded-lg border bg-card p-4 text-left hover:border-primary ${
                selected === module.id ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{module.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-bold">{module.count}</div>
              <div className="mt-1 text-sm text-muted-foreground">{module.status}</div>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">{active.label}</h2>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    <td className="px-3 py-2 font-medium">{active.label} record {row}</td>
                    <td className="px-3 py-2 text-muted-foreground">Operations</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Active</span>
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">Today</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Module summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Module" value={active.label} />
              <Summary label="Records" value={String(active.count)} />
              <Summary label="Status" value={active.status} />
              <Summary label="Access" value="Admin" />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Pending actions</h2>
            <div className="mt-3 space-y-2">
              {['Review inactive users', 'Approve role changes', 'Export audit log'].map((action) => (
                <button key={action} type="button" className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent">
                  {action}
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
      <span className="font-medium">{value}</span>
    </div>
  )
}
