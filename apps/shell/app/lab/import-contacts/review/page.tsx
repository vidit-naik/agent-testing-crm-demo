'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Download, RotateCcw } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import {
  IMPORT_STEPS,
  IMPORT_DEFAULT,
  CRM_FIELDS,
  type ImportState,
} from '../_steps'
import { getWizard, clearWizard } from '@/lib/wizard-store'

type ImportMode = 'create' | 'update' | 'merge'

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function ReviewStep() {
  const router = useRouter()
  const [state, setState] = useState<ImportState>(IMPORT_DEFAULT)
  const [mode, setMode] = useState<ImportMode>('merge')
  const [skipped, setSkipped] = useState<number[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; failed: number } | null>(null)

  useEffect(() => {
    const loaded = getWizard('import', IMPORT_DEFAULT)
    if (!loaded.fileName || Object.keys(loaded.mapping).length === 0) {
      router.replace('/lab/import-contacts/upload')
      return
    }
    setState(loaded)
  }, [router])

  const mapped = useMemo(() => {
    const headerIdx = new Map(state.rawHeaders.map((header, index) => [header, index]))
    return state.rows.map((row, rowIndex) => {
      const obj: Record<string, string> = { rowId: String(rowIndex + 1) }
      for (const field of CRM_FIELDS) {
        const source = state.mapping[field.key]
        const index = source ? headerIdx.get(source) : undefined
        obj[field.key] = index !== undefined ? row[index] || '' : ''
      }
      return obj
    })
  }, [state])

  const rowIssues = useMemo(() => {
    const seen = new Map<string, number>()
    return mapped.map((row) => {
      const issues: string[] = []
      if (!row.firstName) issues.push('Missing first name')
      if (!row.lastName) issues.push('Missing last name')
      if (!row.email) issues.push('Missing email')
      else if (!looksLikeEmail(row.email)) issues.push('Invalid email')
      else if (seen.has(row.email)) issues.push('Duplicate email')
      if (row.email) seen.set(row.email, Number(row.rowId))
      return issues
    })
  }, [mapped])

  const issueRows = rowIssues.filter((issues) => issues.length > 0).length
  const importable = mapped.length - issueRows - skipped.length

  const toggleSkip = (index: number) => {
    setSkipped((current) =>
      current.includes(index) ? current.filter((id) => id !== index) : [...current, index]
    )
  }

  const startImport = async () => {
    setImporting(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    clearWizard('import')
    setResult({
      imported: Math.max(0, importable),
      skipped: skipped.length,
      failed: issueRows,
    })
    setImporting(false)
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold">Import complete</h1>
          <p className="text-muted-foreground">{state.fileName} has been processed.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ResultCard label="Imported" value={result.imported} />
          <ResultCard label="Skipped" value={result.skipped} />
          <ResultCard label="Needs review" value={result.failed} />
        </div>

        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/contacts')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            View contacts
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Error report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Review import</h1>
        <p className="text-muted-foreground">{mapped.length} contacts from {state.fileName}</p>
      </div>
      <WizardSteps steps={IMPORT_STEPS} currentId="review" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div>
              <h2 className="text-sm font-semibold">Contacts</h2>
              <p className="text-xs text-muted-foreground">
                {importable} ready · {issueRows} need review · {skipped.length} skipped
              </p>
            </div>
            <div className="flex rounded-md border bg-background p-1">
              {(['create', 'update', 'merge'] as ImportMode[]).map((nextMode) => (
                <button
                  key={nextMode}
                  type="button"
                  onClick={() => setMode(nextMode)}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize ${
                    mode === nextMode ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                >
                  {nextMode}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  {CRM_FIELDS.map((field) => (
                    <th key={field.key} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mapped.map((row, index) => {
                  const issues = rowIssues[index]
                  const isSkipped = skipped.includes(index)
                  return (
                    <tr key={row.rowId} className={isSkipped ? 'bg-muted/40 text-muted-foreground' : ''}>
                      <td className="whitespace-nowrap px-3 py-2">
                        {issues.length ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                            <AlertTriangle className="h-3 w-3" />
                            Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Ready
                          </span>
                        )}
                        {issues.length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">{issues.join(', ')}</div>
                        )}
                      </td>
                      {CRM_FIELDS.map((field) => (
                        <td key={field.key} className="whitespace-nowrap px-3 py-2">
                          {row[field.key] || <span className="text-muted-foreground">-</span>}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => toggleSkip(index)}
                          className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                        >
                          {isSkipped ? 'Restore' : 'Skip'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Summary</h2>
            <div className="mt-4 space-y-3">
              <SummaryRow label="Mode" value={mode} />
              <SummaryRow label="Ready" value={String(importable)} />
              <SummaryRow label="Needs review" value={String(issueRows)} />
              <SummaryRow label="Skipped" value={String(skipped.length)} />
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Import rules</h2>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Create adds contacts that do not exist.</p>
              <p>Update changes matching contacts.</p>
              <p>Merge creates new contacts and updates matches.</p>
            </div>
          </section>
        </aside>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => router.push('/lab/import-contacts/map')}
          className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={startImport}
          disabled={importing || importable <= 0}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {importing ? 'Importing...' : `Import ${importable} contacts`}
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  )
}

function ResultCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <div className="text-3xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
