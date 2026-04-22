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
    heading: 'Canvas / inline frameworks',
    entries: [
      {
        href: '/lab/seatmap',
        title: 'Seat map',
        desc: 'Canvas event booking (Lit Web Component).',
        icon: MapIcon,
        tag: 'Lit',
      },
      {
        href: '/lab/workflow',
        title: 'Workflow builder',
        desc: 'Pan/zoom node canvas (xyflow).',
        icon: Workflow,
        tag: 'React',
      },
    ],
  },
  {
    heading: 'Cross-stack',
    entries: [
      {
        href: '/lab/reports',
        title: 'Reports (admin)',
        desc: 'Virtualized ag-Grid 10k rows — iframed Vite React.',
        icon: BarChart3,
        tag: 'Vite · iframe',
      },
      {
        href: '/lab/quote',
        title: 'Quote builder',
        desc: 'Multi-step cross-domain quote flow.',
        icon: FileCheck,
        tag: 'Angular · link-out',
      },
      {
        href: '/lab/pricing-calc',
        title: 'Pricing calculator',
        desc: 'Legacy Vue 2 options API SFC.',
        icon: Calculator,
        tag: 'Vue 2 · link-out',
      },
      {
        href: '/lab/legacy-admin',
        title: 'Legacy admin',
        desc: 'AngularJS 1.x hosting React via react2angular.',
        icon: Server,
        tag: 'AngularJS · link-out',
      },
    ],
  },
  {
    heading: 'Real-time & streaming',
    entries: [
      {
        href: '/lab/live-board',
        title: 'Live deal board',
        desc: 'Yjs + WebSocket. "Connected — syncing" ≠ online.',
        icon: Activity,
        tag: 'Yjs',
      },
      {
        href: '/lab/collab-notes',
        title: 'Collaborative notes',
        desc: 'Multi-user RBAC state verification.',
        icon: Users2,
        tag: 'Yjs',
      },
      {
        href: '/lab/feed',
        title: 'Activity feed',
        desc: 'SSE-streamed reducer chat.',
        icon: Rss,
        tag: 'SSE',
      },
    ],
  },
  {
    heading: 'Diagnostics',
    entries: [
      {
        href: '/lab/diagnose/runtime-crash',
        title: 'Runtime crash',
        desc: 'Synthetic window.onerror post-nav.',
        icon: Bug,
        tag: 'diagnose',
      },
      {
        href: '/lab/diagnose/backend-down',
        title: 'Backend down',
        desc: 'Wizard with 504-returning API.',
        icon: Bug,
        tag: 'diagnose',
      },
      {
        href: '/lab/diagnose/eventual-vs-stale',
        title: 'Eventual vs stale',
        desc: '2.5s ± 500ms settle, or ?broken=1.',
        icon: Bug,
        tag: 'diagnose',
      },
    ],
  },
  {
    heading: 'Anti-patterns',
    entries: [
      {
        href: '/lab/anti/newpage-shotgun',
        title: 'Newpage shotgun',
        desc: 'Limit ≤2 fresh pages.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/full-rerun-debug',
        title: 'Full rerun debug',
        desc: '90s full suite; narrow output.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/snapshot-drift',
        title: 'Snapshot drift',
        desc: 'aria-ref IDs rotate.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/timeout-bump',
        title: 'Timeout bump',
        desc: 'Wrong selector resolves fast.',
        icon: AlertTriangle,
        tag: 'anti',
      },
      {
        href: '/lab/anti/path-not-dir',
        title: 'Path not dir',
        desc: 'Flaky read returns ENOTDIR.',
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
          Deliberately hard-to-test surfaces. Each page exercises one or more agent pain points.
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
