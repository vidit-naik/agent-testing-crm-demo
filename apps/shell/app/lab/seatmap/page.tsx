'use client'

import { useEffect, useState } from 'react'

export default function SeatMapPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    import('@crm/seatmap').catch((e) => console.warn('Seatmap component not built:', e))
  }, [])

  useEffect(() => {
    const el = document.querySelector('crm-seatmap')
    if (!el) return
    const onSelect = (e: any) => {
      setSelected(e.detail?.seats || [])
      setTotal(e.detail?.total || 0)
    }
    el.addEventListener('seat-change', onSelect as any)
    return () => el.removeEventListener('seat-change', onSelect as any)
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Seat map</h1>
        <p className="text-muted-foreground">
          Canvas-rendered seat selection inside a Lit Web Component. Pixel-coord clicks only.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-4">
        {/* @ts-expect-error - custom element defined at runtime */}
        <crm-seatmap class="block w-full" />
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-baseline gap-4">
          <span className="text-sm text-muted-foreground">Selected:</span>
          <span className="font-medium">{selected.join(', ') || 'none'}</span>
        </div>
        <div className="flex items-baseline gap-4 mt-2">
          <span className="text-sm text-muted-foreground">Total Amount Due:</span>
          <span id="total-amount-due" className="text-2xl font-bold">
            ${total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
