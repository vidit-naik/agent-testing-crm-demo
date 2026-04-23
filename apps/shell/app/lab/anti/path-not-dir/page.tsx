'use client'

import { useState } from 'react'
import { FileText, FolderOpen, AlertCircle } from 'lucide-react'

const FILES = [
  'contract-2024-Q4.pdf',
  'pricing-acme.pdf',
  'kickoff-deck.pdf',
  'msa-globex.pdf',
  'sow-initech.pdf',
]

export default function AttachmentsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const open = async (name: string) => {
    setSelected(name)
    setLoading(true)
    setError(null)
    setPreview(null)
    try {
      const res = await fetch(`/api/anti/read-file?path=attachments/${name}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not open file')
      } else {
        const data = await res.json()
        setPreview(data.snippet || '(empty file)')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const retry = () => {
    if (selected) open(selected)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderOpen className="h-7 w-7 text-primary" />
          Attachments
        </h1>
        <p className="text-muted-foreground">Files linked to this opportunity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px,1fr]">
        <div className="rounded-lg border bg-card">
          <ul className="divide-y">
            {FILES.map((f) => (
              <li key={f}>
                <button
                  onClick={() => open(f)}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-accent inline-flex items-center gap-2 ${
                    selected === f ? 'bg-accent' : ''
                  }`}
                  data-testid={`file-${f}`}
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{f}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-5">
          {!selected ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Select a file to preview.
            </p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Loading {selected}...</p>
          ) : error ? (
            <div className="space-y-3">
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-rose-900">
                  <div className="font-medium">Preview failed</div>
                  <p className="font-mono text-xs mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={retry}
                className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          ) : (
            <div>
              <div className="text-xs text-muted-foreground mb-2">{selected}</div>
              <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">{preview}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
