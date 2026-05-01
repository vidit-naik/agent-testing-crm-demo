'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import {
  IMPORT_STEPS,
  IMPORT_DEFAULT,
  SAMPLE_HEADERS,
  SAMPLE_ROWS,
  type ImportState,
} from '../_steps'
import { setWizard } from '@/lib/wizard-store'

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return { headers: [], rows: [] }
  const split = (line: string) => line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''))
  return { headers: split(lines[0]), rows: lines.slice(1).map(split) }
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function UploadStep() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])

  const emailIndex = useMemo(
    () => headers.findIndex((header) => /email/i.test(header)),
    [headers]
  )

  const quality = useMemo(() => {
    const emails = emailIndex >= 0 ? rows.map((row) => row[emailIndex] || '') : []
    const duplicateEmails = emails.filter((email, index) => email && emails.indexOf(email) !== index)
    const invalidEmails = emails.filter((email) => email && !looksLikeEmail(email))
    const missingEmails = emails.filter((email) => !email)
    return {
      validRows: rows.length - invalidEmails.length - missingEmails.length,
      duplicateEmails: new Set(duplicateEmails).size,
      invalidEmails: invalidEmails.length,
      missingEmails: missingEmails.length,
    }
  }, [emailIndex, rows])

  const loadSample = () => {
    setFileName('contacts-sample.csv')
    setHeaders(SAMPLE_HEADERS)
    setRows([
      ...SAMPLE_ROWS,
      ['Priya', 'Ramanathan', 'priya@acme.com', '415-555-0182', 'ACME Corp', 'VP Ops'],
      ['Noah', 'Kim', 'noah.example.com', '646-555-0199', 'Northwind', 'Director'],
    ])
  }

  const onFile = async (file: File) => {
    setFileName(file.name)
    const text = await file.text()
    const parsed = parseCsv(text)
    setHeaders(parsed.headers)
    setRows(parsed.rows)
  }

  const next = () => {
    const state: ImportState = {
      ...IMPORT_DEFAULT,
      fileName,
      rawHeaders: headers,
      rows,
    }
    setWizard('import', state)
    router.push('/lab/import-contacts/map')
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Import contacts</h1>
        <p className="text-muted-foreground">Bring a contact list into the CRM.</p>
      </div>
      <WizardSteps steps={IMPORT_STEPS} currentId="upload" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-lg border-2 border-dashed bg-card p-8 text-center">
          <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
          <div className="mt-3">
            <p className="font-medium">Upload contact CSV</p>
            <p className="mt-1 text-xs text-muted-foreground">CSV files up to 10,000 rows</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onFile(file)
            }}
          />
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Choose file
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Use sample data
            </button>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">File quality</h2>
          <div className="mt-4 space-y-3">
            <Metric label="Rows" value={rows.length.toLocaleString()} />
            <Metric label="Columns" value={headers.length.toLocaleString()} />
            <Metric label="Valid rows" value={Math.max(0, quality.validRows).toLocaleString()} />
            <Metric label="Duplicates" value={quality.duplicateEmails.toLocaleString()} tone={quality.duplicateEmails ? 'warn' : 'ok'} />
            <Metric label="Email issues" value={(quality.invalidEmails + quality.missingEmails).toLocaleString()} tone={quality.invalidEmails || quality.missingEmails ? 'warn' : 'ok'} />
          </div>
        </section>
      </div>

      {fileName && (
        <section className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{fileName}</div>
              <div className="text-xs text-muted-foreground">
                {rows.length} rows · {headers.length} columns
              </div>
            </div>
            <button
              type="button"
              onClick={next}
              disabled={rows.length === 0 || headers.length === 0}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Continue
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.slice(0, 6).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, headerIndex) => (
                      <td key={header} className="whitespace-nowrap px-3 py-2">
                        {row[headerIndex] || <span className="text-muted-foreground">-</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-semibold">
        {tone === 'ok' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
        {tone === 'warn' && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
        {value}
      </span>
    </div>
  )
}
