'use client'

import Link from 'next/link'
import {
  Map as MapIcon,
  BarChart3,
  FileCheck,
  Calculator,
  Activity,
  Workflow,
  Users2,
  Rss,
  Server,
  AlertTriangle,
  Bug,
  Rocket,
  Upload,
  Megaphone,
} from 'lucide-react'

type Entry = {
  href: string
  title: string
  desc: string
  icon: any
  tag: string
}

const SECTIONS: { heading: string; entries: Entry[] }[] = [
  {
    heading: 'Workflows',
    entries: [
      {
        href: '/lab/onboarding',
        title: 'Workspace onboarding',
        desc: 'Set up a workspace, invite teammates, and review launch settings.',
        icon: Rocket,
        tag: '4 pages',
      },
      {
        href: '/lab/import-contacts',
        title: 'Import contacts',
        desc: 'Upload, map, review, and process a contact list.',
        icon: Upload,
        tag: '3 pages',
      },
      {
        href: '/lab/campaigns',
        title: 'Campaign builder',
        desc: 'Plan audiences, design messages, and schedule outreach.',
        icon: Megaphone,
        tag: '5 pages',
      },
    ],
  },
  {
    heading: 'Interactive tools',
    entries: [
      {
        href: '/lab/seatmap',
        title: 'Seat map',
        desc: 'Reserve movie seats and complete ticket checkout.',
        icon: MapIcon,
        tag: 'Lit',
      },
      {
        href: '/lab/workflow',
        title: 'Workflow builder',
        desc: 'Design, validate, and publish lead routing automations.',
        icon: Workflow,
        tag: 'React',
      },
    ],
  },
  {
    heading: 'Business tools',
    entries: [
      {
        href: '/lab/reports',
        title: 'Reports (admin)',
        desc: 'Review pipeline reports and revenue data.',
        icon: BarChart3,
        tag: 'Reports',
      },
      {
        href: '/lab/quote',
        title: 'Quote builder',
        desc: 'Prepare quote terms and continue to checkout.',
        icon: FileCheck,
        tag: 'Angular · link-out',
      },
      {
        href: '/lab/pricing-calc',
        title: 'Pricing calculator',
        desc: 'Estimate plan costs and product add-ons.',
        icon: Calculator,
        tag: 'Vue 2 · link-out',
      },
      {
        href: '/lab/legacy-admin',
        title: 'Legacy admin',
        desc: 'Manage administrative settings and records.',
        icon: Server,
        tag: 'AngularJS · link-out',
      },
    ],
  },
  {
    heading: 'Live workspaces',
    entries: [
      {
        href: '/lab/live-board',
        title: 'Live deal board',
        desc: 'Manage opportunities on a synchronized pipeline board.',
        icon: Activity,
        tag: 'Yjs',
      },
      {
        href: '/lab/collab-notes',
        title: 'Collaborative notes',
        desc: 'Share deal notes with role-based editing.',
        icon: Users2,
        tag: 'Yjs',
      },
      {
        href: '/lab/feed',
        title: 'Activity feed',
        desc: 'Generate a digest from recent account activity.',
        icon: Rss,
        tag: 'Digest',
      },
    ],
  },
  {
    heading: 'Operations',
    entries: [
      {
        href: '/lab/diagnose/runtime-crash',
        title: 'Runtime crash',
        desc: 'Review a workspace recovery event.',
        icon: Bug,
        tag: 'diagnose',
      },
      {
        href: '/lab/diagnose/backend-down',
        title: 'Backend down',
        desc: 'Monitor service availability during setup.',
        icon: Bug,
        tag: 'diagnose',
      },
      {
        href: '/lab/diagnose/eventual-vs-stale',
        title: 'Eventual vs stale',
        desc: 'Compare pending and refreshed account data.',
        icon: Bug,
        tag: 'diagnose',
      },
    ],
  },
  {
    heading: 'Resilience checks',
    entries: [
      {
        href: '/lab/anti/newpage-shotgun',
        title: 'Workspace unavailable',
        desc: 'Review restricted workspace access.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/full-rerun-debug',
        title: 'Debug run',
        desc: 'Review a long-running diagnostic job.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/snapshot-drift',
        title: 'Keyboard shortcuts',
        desc: 'Review shortcut assignments and labels.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/timeout-bump',
        title: 'Timeout review',
        desc: 'Review delayed workspace actions.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/path-not-dir',
        title: 'File access',
        desc: 'Review a document access request.',
        icon: AlertTriangle,
        tag: 'anti',
      },
    ],
  },
]

export default function LabIndex() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Lab</h1>
        <p className="text-muted-foreground">
          Product workflows, operational tools, and live collaboration surfaces.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {section.heading}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {section.entries.map((e) => {
              const Icon = e.icon
              return (
                <Link
                  key={e.href}
                  href={e.href}
                  className="group rounded-lg border bg-card p-4 hover:border-primary hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm truncate">{e.title}</h3>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {e.tag}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{e.desc}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
