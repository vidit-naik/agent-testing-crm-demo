'use client'

import { useCallback, useEffect, useState } from 'react'

export default function EventualVsStalePage() {
  const [entities, setEntities] = useState<string[]>([])
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setBroken(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('broken') === '1')
  }, [])

  const load = useCallback(async () => {
    const res = await fetch('/api/diagnose/eventual' + (broken ? '?broken=1' : ''))
    const data = await res.json()
    setEntities(data.entities || [])
  }, [broken])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    const name = `Item-${Math.floor(Math.random() * 9999)}`
    setLastSubmitted(name)
    setPolling(true)
    await fetch('/api/diagnose/eventual' + (broken ? '?broken=1' : ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    const start = Date.now()
    const poll = setInterval(async () => {
      await load()
      if (Date.now() - start > 10000) {
        clearInterval(poll)
        setPolling(false)
      }
    }, 400)
    setTimeout(() => {
      clearInterval(poll)
      setPolling(false)
    }, 10000)
  }

  const appears = lastSubmitted && entities.includes(lastSubmitted)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Eventual vs stale</h1>
        <p className="text-muted-foreground">
          Saves settle in 2.5s ± 500ms. <code>?broken=1</code> never settles &mdash; that&apos;s a real bug.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <p className="text-sm">
          Mode: <strong>{broken ? 'broken (never settles)' : 'eventual (~2.5s)'}</strong>
        </p>
        <button
          onClick={submit}
          disabled={polling}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {polling ? 'Polling...' : 'Create item'}
        </button>
        {lastSubmitted && (
          <p className="text-sm">
            Last submitted: <code>{lastSubmitted}</code> —{' '}
            <span className={appears ? 'text-emerald-600' : 'text-amber-600'}>
              {appears ? 'appears' : 'pending'}
            </span>
          </p>
        )}
        <div className="rounded-md border bg-background p-3 text-sm">
          <div className="text-muted-foreground text-xs mb-1">Current entities</div>
          {entities.length === 0 ? (
            <span className="text-muted-foreground">none</span>
          ) : (
            entities.map((e) => (
              <div key={e} data-entity={e}>
                {e}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
