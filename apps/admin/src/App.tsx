import { useMemo, useRef, useState } from 'react'

type Row = {
  id: number
  account: string
  owner: string
  stage: 'Won' | 'Lost' | 'Open'
  value: number
  closeDate: string
}

const STAGES: Row['stage'][] = ['Won', 'Lost', 'Open']
const OWNERS = ['Alice Chen', 'Bob Smith', 'Carol Ng', 'Dan Rivera', 'Emma Park']

function generateRows(n: number): Row[] {
  const rng = (s: number) => {
    let x = s
    return () => {
      x = (x * 1664525 + 1013904223) % 2 ** 31
      return x
    }
  }
  const r = rng(42)
  const out: Row[] = []
  for (let i = 0; i < n; i++) {
    const yr = 2024 + (r() % 2)
    const mo = (r() % 12) + 1
    const d = (r() % 28) + 1
    out.push({
      id: i + 1,
      account: `Account ${(r() % 1500).toString().padStart(4, '0')}`,
      owner: OWNERS[r() % OWNERS.length],
      stage: STAGES[r() % STAGES.length],
      value: 1000 + (r() % 450000),
      closeDate: `${yr}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    })
  }
  return out
}

const ROW_H = 36

export function App() {
  const [rows] = useState<Row[]>(() => generateRows(10000))
  const [stage, setStage] = useState<'' | Row['stage']>('')
  const [owner, setOwner] = useState('')
  const [search, setSearch] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const filtered = useMemo(() => {
    const needle = search.toLowerCase()
    return rows.filter(
      (r) =>
        (!stage || r.stage === stage) &&
        (!owner || r.owner === owner) &&
        (!needle || r.account.toLowerCase().includes(needle))
    )
  }, [rows, stage, owner, search])

  const total = filtered.length
  const height = total * ROW_H
  const viewport = 540
  const overscan = 4
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - overscan)
  const end = Math.min(total, start + Math.ceil(viewport / ROW_H) + overscan * 2)
  const visible = filtered.slice(start, end)

  return (
    <div className="app">
      <div className="app-header">
        <h1>Reports · pipeline rows</h1>
        <span className="status">
          {filtered.length.toLocaleString()} / {rows.length.toLocaleString()} rows
        </span>
      </div>

      <div className="filters">
        <input
          placeholder="Search account..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={stage} onChange={(e) => setStage((e.target.value || '') as any)}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">All owners</option>
          {OWNERS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="grid-wrap">
        <div className="grid-head">
          <div>ID</div>
          <div>Account</div>
          <div>Owner</div>
          <div>Stage</div>
          <div>Value</div>
          <div>Close date</div>
        </div>

        <div
          className="virtual-scroll"
          ref={scrollRef}
          onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
          <div style={{ height, position: 'relative' }}>
            <div style={{ position: 'absolute', top: start * ROW_H, left: 0, right: 0 }}>
              {visible.map((r) => (
                <div className="grid-row" key={r.id} style={{ height: ROW_H }} data-row-id={r.id}>
                  <div>#{r.id}</div>
                  <div>{r.account}</div>
                  <div>{r.owner}</div>
                  <div>
                    <span
                      className={
                        r.stage === 'Won'
                          ? 'pill pill-won'
                          : r.stage === 'Lost'
                          ? 'pill pill-lost'
                          : 'pill pill-open'
                      }
                    >
                      {r.stage}
                    </span>
                  </div>
                  <div>${r.value.toLocaleString()}</div>
                  <div>{r.closeDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
