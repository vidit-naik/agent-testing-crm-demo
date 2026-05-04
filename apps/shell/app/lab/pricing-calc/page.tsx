'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Calculator, ExternalLink, SlidersHorizontal } from 'lucide-react'

const ADDONS = [
  { id: 'automation', name: 'Automation', price: 24 },
  { id: 'forecasting', name: 'Forecasting', price: 18 },
  { id: 'support', name: 'Premium support', price: 12 },
]

export default function PricingCalcPage() {
  const [seats, setSeats] = useState(35)
  const [plan, setPlan] = useState('growth')
  const [billing, setBilling] = useState('annual')
  const [addons, setAddons] = useState<string[]>(['automation'])

  const basePrice = plan === 'starter' ? 49 : plan === 'growth' ? 89 : 139
  const addonTotal = ADDONS.filter((addon) => addons.includes(addon.id)).reduce((sum, addon) => sum + addon.price, 0)
  const monthly = seats * (basePrice + addonTotal)
  const discount = billing === 'annual' ? Math.round(monthly * 12 * 0.15) : 0
  const yearly = monthly * 12 - discount

  const tier = useMemo(() => {
    if (seats >= 100) return 'Enterprise'
    if (seats >= 25) return 'Growth'
    return 'Starter'
  }, [seats])

  const toggleAddon = (id: string) => {
    setAddons((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Pricing calculator</h1>
          <p className="text-muted-foreground">Estimate subscription cost by seats, plan, and add-ons.</p>
        </div>
        <Link
          href="/legacy/pricing/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Open calculator
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Estimate inputs</h2>
          </div>
          <div className="space-y-6">
            <label className="block">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Seats</span>
                <span className="text-muted-foreground">{seats}</span>
              </div>
              <input
                type="range"
                min="1"
                max="250"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full"
              />
            </label>

            <div>
              <div className="mb-2 text-sm font-medium">Plan</div>
              <div className="grid gap-2 md:grid-cols-3">
                {['starter', 'growth', 'enterprise'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPlan(option)}
                    className={`rounded-md border p-3 text-left capitalize hover:bg-accent ${
                      plan === option ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="font-medium">{option}</div>
                    <div className="text-sm text-muted-foreground">
                      ${option === 'starter' ? 49 : option === 'growth' ? 89 : 139}/seat
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">Add-ons</div>
              <div className="grid gap-2 md:grid-cols-3">
                {ADDONS.map((addon) => (
                  <label key={addon.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                    <span>
                      <span className="block font-medium">{addon.name}</span>
                      <span className="text-muted-foreground">${addon.price}/seat</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={addons.includes(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">Billing</div>
              <div className="flex rounded-md border bg-background p-1">
                {['monthly', 'annual'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBilling(option)}
                    className={`flex-1 rounded px-3 py-2 text-sm font-medium capitalize ${
                      billing === option ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Estimate</h2>
            </div>
            <div className="space-y-3 text-sm">
              <Summary label="Recommended tier" value={tier} />
              <Summary label="Monthly" value={`$${monthly.toLocaleString()}`} />
              <Summary label="Annual discount" value={`-$${discount.toLocaleString()}`} />
              <div className="flex justify-between border-t pt-3 text-base font-bold">
                <span>Annual total</span>
                <span>${yearly.toLocaleString()}</span>
              </div>
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Package</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">{plan}</span>
              {ADDONS.filter((addon) => addons.includes(addon.id)).map((addon) => (
                <span key={addon.id} className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {addon.name}
                </span>
              ))}
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
