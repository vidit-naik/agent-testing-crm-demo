'use client'

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Iframed Vite + React admin app with ag-Grid. Cross-origin frame-locator territory.
        </p>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <iframe
          title="Reports admin"
          src="/admin/"
          className="w-full h-[70vh] border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  )
}
