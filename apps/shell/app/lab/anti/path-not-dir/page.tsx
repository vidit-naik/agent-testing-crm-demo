'use client'

import { useState } from 'react'

export default function PathNotDirPage() {
  const [result, setResult] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const read = async () => {
    setErr(null)
    setResult(null)
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
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Path not dir</h1>
        <p className="text-muted-foreground">
          Flaky read returns <code>ENOTDIR</code> the first time on a valid <code>.tsx</code>, then
          succeeds. Agents should retry the same path, not loop on <code>/index.tsx</code> variants.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <button
          onClick={read}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
        >
          Read file
        </button>
        {err && <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
        {result && (
          <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">{result}</pre>
        )}
      </div>
    </div>
  )
}
