'use client'

import { useEffect, useState } from 'react'
import { Building2, Calendar, CheckCircle2, Edit, Mail, Phone, ShieldAlert, Trash2, User } from 'lucide-react'

type Activity = { date: string; text: string; type: string }

const ACTIVITIES: Activity[] = [
  { date: 'Today', text: 'Proposal package opened twice', type: 'Engagement' },
  { date: 'May 2', text: 'Pricing exception approved by finance', type: 'Approval' },
  { date: 'Apr 29', text: 'Implementation timeline reviewed', type: 'Meeting' },
]

export default function ContactProfilePage() {
  const [activity, setActivity] = useState<Activity[] | null>(null)
  const [health, setHealth] = useState<'loading' | 'healthy' | 'recovered'>('loading')

  useEffect(() => {
    const t = setTimeout(() => {
      setActivity(ACTIVITIES)
      setHealth('recovered')
    }, 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Priya Ramanathan</h1>
            <p className="text-muted-foreground">VP Operations · ACME Corp</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact details</h2>
              <dl className="space-y-3 text-sm">
                <Detail icon={Mail} value="priya@acme.com" />
                <Detail icon={Phone} value="+1 (415) 555-0182" />
                <Detail icon={Building2} value="ACME Corp · 250-500 employees" />
                <Detail icon={Calendar} value="Added Mar 3, 2026" />
              </dl>
            </div>

            <div className="rounded-lg border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Open opportunities</h2>
              <ul className="space-y-3 text-sm">
                <Opportunity name="ACME Q3 expansion" stage="Proposal" value="$145,000" />
                <Opportunity name="Training add-on" stage="Qualification" value="$18,500" />
              </ul>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</h2>
            {activity === null ? (
              <div className="text-sm text-muted-foreground">Loading activity...</div>
            ) : (
              <ul className="space-y-3 text-sm">
                {activity.map((item, index) => (
                  <li key={index} className="flex gap-3 rounded-md border p-3">
                    <span className="w-20 text-xs text-muted-foreground">{item.date}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.text}</div>
                      <div className="text-xs text-muted-foreground">{item.type}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              {health === 'loading' ? (
                <ShieldAlert className="h-4 w-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
              <h2 className="text-sm font-semibold">Workspace health</h2>
            </div>
            <div className="text-2xl font-bold capitalize">{health}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Contact data and activity timeline are available.
            </p>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Account signals</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Engagement" value="High" />
              <Summary label="Renewal risk" value="Low" />
              <Summary label="Expansion fit" value="Strong" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Detail({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{value}</span>
    </div>
  )
}

function Opportunity({ name, stage, value }: { name: string; stage: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{value}</div>
      </div>
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{stage}</span>
    </li>
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
