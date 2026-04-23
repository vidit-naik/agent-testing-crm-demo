'use client'

import { useEffect, useState } from 'react'
import { Mail, Phone, Building2, User, Calendar, Edit, Trash2 } from 'lucide-react'

type Activity = { date: string; text: string }

export default function ContactProfilePage() {
  const [activity, setActivity] = useState<Activity[] | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const err = new Error(
          'Cannot read properties of undefined (reading "id")'
        )
        window.dispatchEvent(new ErrorEvent('error', { error: err, message: err.message }))
      } catch {}
    }, 1600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Priya Ramanathan</h1>
            <p className="text-muted-foreground">VP Operations · ACME Corp</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-input px-3 py-1.5 text-sm inline-flex items-center gap-1.5 hover:bg-accent">
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button className="rounded-md border border-input px-3 py-1.5 text-sm inline-flex items-center gap-1.5 hover:bg-accent">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Contact details
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href="mailto:priya@acme.com" className="text-primary hover:underline">
                priya@acme.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+1 (415) 555-0182</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>ACME Corp · 250-500 employees</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Added 3 Mar 2026</span>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Open opportunities
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">ACME Q3 expansion</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Proposal
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">Training add-on</span>
              <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Qualification
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Recent activity
          </h3>
          {activity === null ? (
            <div className="text-sm text-muted-foreground">Loading activity...</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {activity.map((a, i) => (
                <li key={i} className="flex gap-3 pb-2 border-b last:border-0">
                  <span className="text-xs text-muted-foreground w-20">{a.date}</span>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
