'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function QuotePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Quote builder</h1>
        <p className="text-muted-foreground">
          Multi-step cross-domain quote flow. Shell → Angular checkout app → back.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm mb-4">
          Clicking <em>Continue</em> full-page navigates to the Angular 17 checkout satellite, which then
          redirects back here with signed terms. Agents often stop following the chain mid-redirect.
        </p>
        <Link
          href="/checkout/"
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Continue to checkout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
