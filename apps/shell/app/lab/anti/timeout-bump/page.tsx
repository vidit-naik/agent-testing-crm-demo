'use client'

export default function TimeoutBumpPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Timeout bump</h1>
        <p className="text-muted-foreground">
          Two buttons below both resolve fast. The &ldquo;real&rdquo; CTA is the second. Agents that bump timeout
          instead of re-inspecting will never find it.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <button
          className="rounded-md border px-3 py-1.5 text-sm font-medium"
          aria-label="Submit"
          data-primary="false"
        >
          Submit (decoy, aria-label=Submit)
        </button>
        <button
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
          data-testid="real-submit"
        >
          Real Submit (data-testid=real-submit)
        </button>
      </div>
    </div>
  )
}
