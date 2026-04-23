'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'

export type Step = { id: string; label: string; href: string }

export function WizardSteps({ steps, currentId }: { steps: Step[]; currentId: string }) {
  const currentIdx = steps.findIndex((s) => s.id === currentId)
  return (
    <ol className="flex items-center gap-0 border-b pb-4 mb-6 overflow-x-auto">
      {steps.map((s, i) => {
        const done = i < currentIdx
        const current = i === currentIdx
        return (
          <li key={s.id} className="flex items-center min-w-0">
            <Link
              href={done || current ? s.href : '#'}
              className={`flex items-center gap-2 text-sm whitespace-nowrap ${
                done || current ? '' : 'pointer-events-none'
              }`}
              data-step={s.id}
              data-active={current}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-emerald-100 text-emerald-800'
                    : current
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`font-medium ${
                  current ? 'text-foreground' : done ? 'text-muted-foreground' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </Link>
            {i < steps.length - 1 && (
              <div className="mx-3 h-px w-8 bg-border flex-shrink-0" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
