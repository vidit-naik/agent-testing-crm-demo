'use client'

import { useEffect, useRef, useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

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
      setFinal('Summary ready. 5 accounts at risk, 2 renewals due this week.')
      setStatus('done')
      es.close()
    })
    es.onerror = () => {
      setStatus('error')
      es.close()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity feed"
        subtitle='AI assistant summarizes recent CRM activity by streaming tokens via SSE.'
        route="/lab/feed"
        patterns={['SSE', 'reducer UI', 'final-frame trap']}
      />

      <ScenarioPanel
        story={
          <>
            Sales manager opens the assistant to get a live summary of last week&apos;s activity. The
            backend streams analysis in real time. The final message contains the actionable summary.
          </>
        }
        steps={[
          'Click "Start stream"',
          'Wait for the stream to finish (status → done)',
          'Assert the summary box shows the final recommendation',
          'Reset and try again to confirm deterministic ending',
        ]}
        success={[
          <>
            Test waits for <code className="font-mono text-xs">status=&quot;done&quot;</code>, not
            the first message.
          </>,
          <>
            Summary text is asserted from <code className="font-mono text-xs">#final-summary</code>.
          </>,
          'No reliance on exact token count (stream length may vary).',
        ]}
        gotcha={
          <>
            A naive test waits on the first <code className="font-mono text-xs">data:</code> line and
            reads the summary — but the summary only appears on the <strong>done</strong> event.
            Tests that resolve on the first frame miss it.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={start}
            disabled={status === 'streaming'}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {status === 'streaming' ? 'Streaming...' : status === 'done' ? 'Run again' : 'Start stream'}
          </button>
          <div className="flex items-center gap-2">
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
            <span className="text-xs font-medium uppercase tracking-wide" data-stream-status={status}>
              {status}
            </span>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {lines.length} message{lines.length === 1 ? '' : 's'} received
          </span>
        </div>

        <div
          ref={scrollRef}
          className="rounded-md border bg-slate-950 text-slate-100 p-4 font-mono text-xs space-y-1 h-64 overflow-y-auto"
        >
          {lines.length === 0 ? (
            <span className="text-slate-500">No messages yet. Click Start stream.</span>
          ) : (
            lines.map((l) => (
              <div key={l.id} data-feed-line={l.id} className="flex gap-2">
                <span className="text-slate-500">{String(l.id).padStart(2, '0')}</span>
                <span>{l.text}</span>
              </div>
            ))
          )}
        </div>

        {final ? (
          <div
            id="final-summary"
            data-summary-ready="true"
            className="rounded-md border border-emerald-200 bg-emerald-50 p-4"
          >
            <div className="text-xs font-semibold uppercase text-emerald-700 tracking-wide mb-1">
              Summary
            </div>
            <p className="text-sm text-emerald-900">{final}</p>
          </div>
        ) : (
          <div
            id="final-summary"
            data-summary-ready="false"
            className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground"
          >
            Summary appears here after the stream ends.
          </div>
        )}
      </div>
    </div>
  )
}
