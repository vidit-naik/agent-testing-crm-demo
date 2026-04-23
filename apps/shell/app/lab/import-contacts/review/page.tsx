'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import {
  IMPORT_STEPS,
  IMPORT_DEFAULT,
  CRM_FIELDS,
  type ImportState,
} from '../_steps'
import { getWizard, clearWizard } from '@/lib/wizard-store'

export default function ReviewStep() {
  const router = useRouter()
  const [state, setState] = useState<ImportState>(IMPORT_DEFAULT)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState<number | null>(null)

  useEffect(() => {
    const loaded = getWizard('import', IMPORT_DEFAULT)
    if (!loaded.fileName || Object.keys(loaded.mapping).length === 0) {
      router.replace('/lab/import-contacts/upload')
      return
    }
    setState(loaded)
  }, [router])

  const mapped = useMemo(() => {
    const headerIdx = new Map(state.rawHeaders.map((h, i) => [h, i]))
    return state.rows.map((r) => {
      const obj: Record<string, string> = {}
      for (const field of CRM_FIELDS) {
        const src = state.mapping[field.key]
        const idx = src ? headerIdx.get(src) : undefined
        obj[field.key] = idx !== undefined ? r[idx] || '' : ''
      }
      return obj
    })
  }, [state])

  const startImport = async () => {
    setImporting(true)
    await new Promise((r) => setTimeout(r, 900))
    setDone(mapped.length)
    clearWizard('import')
    setImporting(false)
  }

  if (done !== null) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1">Import complete</h1>
        <p className="text-muted-foreground">
          {done} contact{done === 1 ? '' : 's'} imported.
        </p>
        <button
          onClick={() => router.push('/contacts')}
          className="mt-6 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          View contacts
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Review import</h1>
        <p className="text-muted-foreground">
          {mapped.length} contact{mapped.length === 1 ? '' : 's'} from{' '}
          <strong>{state.fileName}</strong>. Preview below before importing.
        </p>
      </div>
      <WizardSteps steps={IMPORT_STEPS} currentId="review" />

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {CRM_FIELDS.map((f) => (
                <th key={f.key} className="px-3 py-2 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {mapped.slice(0, 10).map((r, i) => (
              <tr key={i} data-preview-row={i}>
                {CRM_FIELDS.map((f) => (
                  <td key={f.key} className="px-3 py-2 whitespace-nowrap">
                    {r[f.key] || <span className="text-muted-foreground">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mapped.length > 10 && (
        <p className="text-xs text-muted-foreground">
          Showing 10 of {mapped.length}. All rows will be imported.
        </p>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/lab/import-contacts/map')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          onClick={startImport}
          disabled={importing}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="start-import"
        >
          {importing ? 'Importing...' : `Import ${mapped.length} contacts`}
        </button>
      </div>
    </div>
  )
}
