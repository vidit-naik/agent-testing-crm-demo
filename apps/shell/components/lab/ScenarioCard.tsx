'use client'

import { Target, ListChecks, ShieldCheck, AlertTriangle } from 'lucide-react'

type Kind = 'story' | 'steps' | 'success' | 'gotcha'

const META: Record<Kind, { icon: any; label: string; tone: string }> = {
  story: {
    icon: Target,
    label: 'User story',
    tone: 'bg-sky-50 border-sky-200 text-sky-900',
  },
  steps: {
    icon: ListChecks,
    label: 'What to test',
    tone: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  success: {
    icon: ShieldCheck,
    label: 'Success criteria',
    tone: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  gotcha: {
    icon: AlertTriangle,
    label: 'Agent pitfall',
    tone: 'bg-rose-50 border-rose-200 text-rose-900',
  },
}

export function ScenarioPanel({
  story,
  steps,
  success,
  gotcha,
}: {
  story?: React.ReactNode
  steps?: (string | React.ReactNode)[]
  success?: (string | React.ReactNode)[]
  gotcha?: React.ReactNode
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {story && <Block kind="story">{story}</Block>}
      {gotcha && <Block kind="gotcha">{gotcha}</Block>}
      {steps && (
        <Block kind="steps">
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Block>
      )}
      {success && (
        <Block kind="success">
          <ul className="space-y-1 text-sm">
            {success.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-700">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}
    </div>
  )
}

function Block({ kind, children }: { kind: Kind; children: React.ReactNode }) {
  const m = META[kind]
  const Icon = m.icon
  return (
    <div className={`rounded-lg border p-4 ${m.tone}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <h3 className="text-xs font-semibold uppercase tracking-wide">{m.label}</h3>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  route,
  patterns,
}: {
  title: string
  subtitle?: string
  route?: string
  patterns?: string[]
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {route && (
          <code className="text-xs bg-muted px-2 py-1 rounded">{route}</code>
        )}
      </div>
      {patterns && patterns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {patterns.map((p) => (
            <span
              key={p}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
