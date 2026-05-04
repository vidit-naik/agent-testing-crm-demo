'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, FileCheck, Percent, Plus, Trash2 } from 'lucide-react'

type LineItem = { id: string; name: string; seats: number; price: number }

const TERMS = ['Net 30', 'Net 45', 'Annual upfront']

export default function QuotePage() {
  const [account, setAccount] = useState('ACME Corp')
  const [term, setTerm] = useState('Annual upfront')
  const [discount, setDiscount] = useState(8)
  const [items, setItems] = useState<LineItem[]>([
    { id: 'platform', name: 'CRM Platform', seats: 45, price: 89 },
    { id: 'automation', name: 'Automation add-on', seats: 45, price: 24 },
    { id: 'support', name: 'Premium support', seats: 1, price: 1200 },
  ])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.seats * item.price, 0),
    [items]
  )
  const discountAmount = Math.round(subtotal * (discount / 100))
  const total = subtotal - discountAmount

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const addItem = () => {
    setItems((current) => [
      ...current,
      { id: `item-${current.length + 1}`, name: 'New product', seats: 1, price: 100 },
    ])
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Quote builder</h1>
          <p className="text-muted-foreground">Prepare commercial terms for customer approval.</p>
        </div>
        <Link
          href="/checkout/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Continue to checkout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Quote details</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Account</span>
                <input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Payment terms</span>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TERMS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Discount</span>
                <div className="flex items-center rounded-md border border-input bg-background px-3 py-2">
                  <input
                    type="number"
                    value={discount}
                    min={0}
                    max={30}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Products</h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                Add product
              </button>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_100px_120px_120px_auto] md:items-center">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={item.seats}
                    min={1}
                    onChange={(e) => updateItem(item.id, { seats: Number(e.target.value) })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={item.price}
                    min={0}
                    onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <div className="text-sm font-semibold">${(item.seats * item.price).toLocaleString()}</div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex justify-center rounded-md border p-2 hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Quote summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Account" value={account} />
              <Summary label="Term" value={term} />
              <Summary label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
              <Summary label="Discount" value={`-$${discountAmount.toLocaleString()}`} />
              <div className="flex justify-between border-t pt-3 text-base font-bold">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Approval</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Finance" value={discount > 10 ? 'Required' : 'Not required'} />
              <Summary label="Legal" value={term === 'Annual upfront' ? 'Ready' : 'Review'} />
              <Summary label="Quote status" value="Draft" />
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
      <span className="font-medium">{value}</span>
    </div>
  )
}
