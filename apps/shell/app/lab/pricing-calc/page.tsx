'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default function PricingCalcPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Pricing calculator</h1>
        <p className="text-muted-foreground">
          Legacy Vue 2 options-API calculator served from the legacy satellite.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm mb-4">
          This opens the Vue 2 app at <code className="font-mono text-xs">/legacy/pricing/</code>.
          Custom VSelect / VInputNumber primitives over Ant Design Vue.
        </p>
        <Link
          href="/legacy/pricing/"
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Open calculator
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
