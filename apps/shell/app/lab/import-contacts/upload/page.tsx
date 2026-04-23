'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet } from 'lucide-react'
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
  const lines = text.trim().split(/\r?\n/)
  if (lines.length === 0) return { headers: [], rows: [] }
  const split = (l: string) => l.split(',').map((s) => s.trim().replace(/^"|"$/g, ''))
  return { headers: split(lines[0]), rows: lines.slice(1).map(split) }
}

export default function UploadStep() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])

  const loadSample = () => {
    setFileName('contacts-sample.csv')
    setHeaders(SAMPLE_HEADERS)
    setRows(SAMPLE_ROWS)
  }

  const onFile = async (f: File) => {
    setFileName(f.name)
    const text = await f.text()
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
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Import contacts</h1>
        <p className="text-muted-foreground">Upload a CSV to bulk-add contacts to your CRM.</p>
      </div>
      <WizardSteps steps={IMPORT_STEPS} currentId="upload" />

      <div className="rounded-lg border-2 border-dashed bg-card p-8 text-center space-y-3">
        <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
        <div>
          <p className="font-medium">Drop a CSV file or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">
            First row should be column headers. Max 10,000 rows.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
          data-testid="file-input"
        />
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
            data-testid="browse-file"
          >
            Choose file
          </button>
          <button
            onClick={loadSample}
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            data-testid="use-sample"
          >
            Use sample data
          </button>
        </div>
      </div>

      {fileName && (
        <div className="rounded-lg border bg-card p-4 flex items-center gap-3" data-file-ready="true">
          <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
          <div className="flex-1">
            <div className="font-medium text-sm">{fileName}</div>
            <div className="text-xs text-muted-foreground">
              {rows.length} row{rows.length === 1 ? '' : 's'} · {headers.length} column
              {headers.length === 1 ? '' : 's'}
            </div>
          </div>
          <button
            onClick={next}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
            data-testid="continue"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
