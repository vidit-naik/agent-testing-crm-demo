'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default function LegacyAdminPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Legacy admin</h1>
        <p className="text-muted-foreground">
          AngularJS 1.x app with react2angular-bridged components. Settings UI for org config.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm mb-4">
          Opens the AngularJS satellite at <code className="font-mono text-xs">/legacy/admin/</code>.
          Mixed ng-model + React state; digest-cycle timing pain.
        </p>
        <Link
          href="/legacy/admin/"
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Open legacy admin
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
