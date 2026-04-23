'use client'

import { useState } from 'react'
import { FileText, FolderOpen } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)

  const open = async (name: string) => {
    setSelected(name)
    setLoading(true)
    setPreview(null)
    try {
      const res = await fetch(`/api/anti/read-file?path=attachments/${name}`)
      if (res.ok) {
        const data = await res.json()
        setPreview(data.snippet || '(empty)')
      }
      // Non-2xx: leave preview null, stop spinner. No UI error.
    } catch {
      // Silent.
    } finally {
      setLoading(false)
    }
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

        <div className="rounded-lg border bg-card p-5 min-h-[200px]">
          {!selected ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Select a file to preview.
            </p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Loading {selected}...</p>
          ) : preview ? (
            <div>
              <div className="text-xs text-muted-foreground mb-2">{selected}</div>
              <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">{preview}</pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              Preview unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
