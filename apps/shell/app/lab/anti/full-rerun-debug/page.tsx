'use client'

import { useState } from 'react'
import { FileBarChart2, Download, RefreshCw } from 'lucide-react'

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [ready, setReady] = useState(false)

  const generate = () => {
    setGenerating(true)
    setReady(false)
    setTimeout(() => {
      setGenerating(false)
      setReady(true)
    }, 1800)
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileBarChart2 className="h-7 w-7 text-primary" />
          Quarterly report
        </h1>
        <p className="text-muted-foreground">Generate the Q3 2026 pipeline report.</p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Period</dt>
            <dd className="font-medium mt-1">Jul 1 – Sep 30, 2026</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Records</dt>
            <dd className="font-medium mt-1">~8,400 opportunities</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Format</dt>
            <dd className="font-medium mt-1">PDF + CSV</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">Est. time</dt>
            <dd className="font-medium mt-1">~2 min</dd>
          </div>
        </dl>

        <div className="flex gap-2">
          <button
            onClick={generate}
            disabled={generating}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileBarChart2 className="h-4 w-4" />
                Generate report
              </>
            )}
          </button>
          {ready && (
            <button className="rounded-md border border-input px-4 py-2 text-sm font-medium inline-flex items-center gap-2 hover:bg-accent">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
        </div>

        {ready && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Report ready. 8,426 opportunities included.
          </div>
        )}
      </div>
    </div>
  )
}
