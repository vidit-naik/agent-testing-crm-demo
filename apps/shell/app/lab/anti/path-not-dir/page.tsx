'use client'

import { useState } from 'react'
import { Download, FileText, FolderOpen, Search } from 'lucide-react'

const FILES = [
  { name: 'contract-2024-Q4.pdf', type: 'Contract', owner: 'Legal' },
  { name: 'pricing-acme.pdf', type: 'Pricing', owner: 'Finance' },
  { name: 'kickoff-deck.pdf', type: 'Deck', owner: 'Success' },
  { name: 'msa-globex.pdf', type: 'Contract', owner: 'Legal' },
  { name: 'sow-initech.pdf', type: 'Statement of work', owner: 'Services' },
]

export default function AttachmentsPage() {
  const [selected, setSelected] = useState<string | null>(FILES[0].name)
  const [preview, setPreview] = useState<string | null>('Preview will appear after the file is loaded.')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = FILES.filter((file) =>
    `${file.name} ${file.type} ${file.owner}`.toLowerCase().includes(query.toLowerCase())
  )

  const open = async (name: string) => {
    setSelected(name)
    setLoading(true)
    setPreview(null)
    try {
      const res = await fetch(`/api/anti/read-file?path=attachments/${name}`)
      if (res.ok) {
        const data = await res.json()
        setPreview(data.snippet || 'No preview text available.')
      } else {
        setPreview('Preview unavailable for this file.')
      }
    } catch {
      setPreview('Preview unavailable for this file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <FolderOpen className="h-7 w-7 text-primary" />
          Attachments
        </h1>
        <p className="text-muted-foreground">Files linked to the opportunity.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)_260px]">
        <aside className="rounded-lg border bg-card">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files"
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
          <ul className="divide-y">
            {filtered.map((file) => (
              <li key={file.name}>
                <button
                  type="button"
                  onClick={() => open(file.name)}
                  className={`inline-flex w-full items-center gap-2 px-3 py-3 text-left text-sm hover:bg-accent ${
                    selected === file.name ? 'bg-accent' : ''
                  }`}
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{file.name}</span>
                    <span className="block text-xs text-muted-foreground">{file.type}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-h-[420px] rounded-lg border bg-card p-5">
          {!selected ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Select a file to preview.</p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Loading {selected}...</p>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{selected}</div>
                  <div className="text-xs text-muted-foreground">Opportunity attachment</div>
                </div>
                <button type="button" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              <pre className="min-h-72 overflow-x-auto rounded-md bg-muted p-4 text-xs">{preview}</pre>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">File details</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Selected" value={selected || '-'} />
              <Summary label="Files" value={String(FILES.length)} />
              <Summary label="Access" value="Deal team" />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Owners</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from(new Set(FILES.map((file) => file.owner))).map((owner) => (
                <span key={owner} className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {owner}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-36 truncate font-medium">{value}</span>
    </div>
  )
}
