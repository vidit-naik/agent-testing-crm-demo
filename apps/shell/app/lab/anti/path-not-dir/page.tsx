'use client'

import { useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

export default function PathNotDirPage() {
  const [result, setResult] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const read = async () => {
    setErr(null)
    setResult(null)
    setAttempts((a) => a + 1)
    try {
      const res = await fetch('/api/anti/read-file?path=components/ui/Modal.tsx')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErr(data.error || `status ${res.status}`)
        return
      }
      const data = await res.json()
      setResult(data.snippet || '(empty)')
    } catch (e: any) {
      setErr(e?.message || 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Path not dir"
        subtitle={`Flaky file-read endpoint: ENOTDIR once, then succeeds. Retry the same path — don't try /index.tsx variants.`}
        route="/lab/anti/path-not-dir"
        patterns={['anti-pattern', 'retry same input', 'error-message literalism']}
      />

      <ScenarioPanel
        story={
          <>
            The read endpoint simulates a filesystem stat race: the first call returns{' '}
            <code className="font-mono text-xs">ENOTDIR</code>, the second succeeds. The path is
            valid; the error is flaky.
          </>
        }
        steps={[
          'Click "Read file"',
          'First attempt fails with ENOTDIR',
          'Click again — second attempt succeeds',
          <>
            Do NOT try <code className="font-mono text-xs">Modal.tsx/index.tsx</code> or{' '}
            <code className="font-mono text-xs">components/ui/Modal/</code> as alternatives
          </>,
        ]}
        success={[
          'Retry is on the same exact path, not a variant.',
          'No path mutation based on literal ENOTDIR text.',
          'Attempt count ≤ 3 before classifying as a real error.',
        ]}
        gotcha={
          <>
            Agents read &ldquo;not a directory&rdquo; and start listing alternative paths —{' '}
            <code className="font-mono text-xs">/index.tsx</code>, trailing slashes, directory
            reads. That burns 10+ tool calls. The message lies; just retry once.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-5 space-y-3" data-attempts={attempts}>
        <button
          onClick={read}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          data-testid="read-file"
        >
          Read file {attempts > 0 && `(attempt ${attempts + 1})`}
        </button>
        {err && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 font-mono">
            {err}
          </div>
        )}
        {result && (
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase text-emerald-700">Success</div>
            <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
