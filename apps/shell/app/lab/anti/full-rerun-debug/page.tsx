'use client'

import { useMemo, useState } from 'react'
import { Download, FileBarChart2, RefreshCw } from 'lucide-react'

const SECTIONS = ['Pipeline', 'Forecast', 'Renewals', 'Activity', 'Risk']

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<string[]>(['Pipeline', 'Forecast', 'Risk'])

  const selectedCount = selected.length
  const records = useMemo(() => selectedCount * 1685 + 42, [selectedCount])

  const generate = () => {
    setGenerating(true)
    setReady(false)
    setTimeout(() => {
      setGenerating(false)
      setReady(true)
    }, 1800)
  }

  const toggle = (section: string) => {
    setSelected((current) =>
      current.includes(section) ? current.filter((item) => item !== section) : [...current, section]
    )
    setReady(false)
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <FileBarChart2 className="h-7 w-7 text-primary" />
          Quarterly report
        </h1>
        <p className="text-muted-foreground">Generate the Q3 2026 pipeline report.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 font-semibold">Report sections</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {SECTIONS.map((section) => (
              <label key={section} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <span className="font-medium">{section}</span>
                <input
                  type="checkbox"
                  checked={selected.includes(section)}
                  onChange={() => toggle(section)}
                />
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generate}
              disabled={generating || selected.length === 0}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileBarChart2 className="h-4 w-4" />}
              {generating ? 'Generating...' : 'Generate report'}
            </button>
            {ready && (
              <button type="button" className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Package</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Period" value="Q3 2026" />
              <Summary label="Sections" value={String(selectedCount)} />
              <Summary label="Records" value={records.toLocaleString()} />
              <Summary label="Format" value="PDF + CSV" />
            </div>
          </section>
          {ready && (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
              <h2 className="text-sm font-semibold">Report ready</h2>
              <p className="mt-2 text-sm">{records.toLocaleString()} records included.</p>
            </section>
          )}
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
