'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'

type Line = { id: number; text: string }

export default function FeedPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle')
  const [final, setFinal] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines])

  const start = () => {
    setLines([])
    setFinal(null)
    setStatus('streaming')
    let counter = 0
    const es = new EventSource('/api/feed/stream')
    es.onmessage = (e) => {
      counter += 1
      setLines((prev) => [...prev, { id: counter, text: e.data }])
    }
    es.addEventListener('done', () => {
      setFinal('5 accounts need attention this week. 2 renewals due Friday. 1 opportunity stalled in Proposal for >14 days.')
      setStatus('done')
      es.close()
    })
    es.onerror = () => {
      setStatus('error')
      es.close()
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          Activity digest
        </h1>
        <p className="text-muted-foreground">AI-generated summary of recent pipeline activity.</p>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={start}
            disabled={status === 'streaming'}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
          >
            {status === 'streaming' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : status === 'done' ? (
              'Regenerate digest'
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate digest
              </>
            )}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                status === 'streaming'
                  ? 'bg-amber-500 animate-pulse'
                  : status === 'done'
                  ? 'bg-emerald-500'
                  : status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs text-muted-foreground" data-stream-status={status}>
              {status === 'idle' ? 'Ready' : status === 'streaming' ? 'Streaming' : status === 'done' ? 'Complete' : 'Error'}
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="rounded-md border bg-slate-950 text-slate-100 p-4 font-mono text-xs space-y-1 h-56 overflow-y-auto"
        >
          {lines.length === 0 ? (
            <span className="text-slate-500">Click &ldquo;Generate digest&rdquo; to run analysis.</span>
          ) : (
            lines.map((l) => (
              <div key={l.id} data-feed-line={l.id} className="flex gap-2">
                <span className="text-slate-500">{String(l.id).padStart(2, '0')}</span>
                <span>{l.text}</span>
              </div>
            ))
          )}
        </div>

        {final && (
          <div
            id="final-summary"
            data-summary-ready="true"
            className="rounded-md border border-primary/30 bg-primary/5 p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                This week
              </span>
            </div>
            <p className="text-sm">{final}</p>
          </div>
        )}
      </div>
    </div>
  )
}
