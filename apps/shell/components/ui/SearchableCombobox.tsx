'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

type Option = { value: string; label: string; [k: string]: any }

export function SearchableCombobox({
  placeholder = 'Search...',
  value,
  label,
  fetcher,
  onChange,
  debounceMs = 300,
  minLatency = 100,
  maxLatency = 800,
}: {
  placeholder?: string
  value: Option | null
  label?: string
  fetcher: (q: string) => Promise<Option[]>
  onChange: (opt: Option | null) => void
  debounceMs?: number
  minLatency?: number
  maxLatency?: number
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const runFetch = useCallback(
    async (q: string) => {
      const id = ++reqId.current
      setLoading(true)
      const jitter = minLatency + Math.random() * (maxLatency - minLatency)
      await new Promise((r) => setTimeout(r, jitter))
      if (id !== reqId.current) return
      try {
        const opts = await fetcher(q)
        if (id !== reqId.current) return
        setOptions(opts)
      } finally {
        if (id === reqId.current) setLoading(false)
      }
    },
    [fetcher, minLatency, maxLatency]
  )

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => runFetch(query), debounceMs)
    return () => clearTimeout(t)
  }, [query, open, runFetch, debounceMs])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className={value ? '' : 'text-muted-foreground'}>{value?.label || placeholder}</span>
        <div className="flex items-center gap-1">
          {value && (
            <X
              className="h-3.5 w-3.5 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
            />
          )}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </div>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border bg-popover shadow-md">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="w-full border-b px-3 py-2 text-sm focus:outline-none"
          />
          <div className="max-h-60 overflow-y-auto p-1">
            {loading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
            ) : options.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No results</div>
            ) : (
              options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o)
                    setOpen(false)
                  }}
                  className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent"
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
