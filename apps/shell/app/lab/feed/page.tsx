'use client'

import { useEffect, useState } from 'react'

export default function FeedPage() {
  const [lines, setLines] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done'>('idle')

  const start = () => {
    setLines([])
    setStatus('streaming')
    const es = new EventSource('/api/feed/stream')
    es.onmessage = (e) => setLines((prev) => [...prev, e.data])
    es.addEventListener('done', () => {
      setStatus('done')
      es.close()
    })
    es.onerror = () => {
      setStatus('done')
      es.close()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Activity feed</h1>
        <p className="text-muted-foreground">
          SSE-streamed reducer output. Tests that wait on a single message miss the final frame.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={start}
          disabled={status === 'streaming'}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {status === 'streaming' ? 'Streaming...' : 'Start stream'}
        </button>
        <span className="text-xs text-muted-foreground" data-stream-status={status}>
          {status}
        </span>
      </div>

      <div className="rounded-lg border bg-card p-4 font-mono text-sm space-y-1 min-h-[240px]">
        {lines.length === 0 ? (
          <span className="text-muted-foreground">No lines yet.</span>
        ) : (
          lines.map((l, i) => (
            <div key={i} data-feed-line={i}>
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
