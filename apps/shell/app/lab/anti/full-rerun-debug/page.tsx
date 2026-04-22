'use client'

export default function FullRerunDebugPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Full rerun debug</h1>
        <p className="text-muted-foreground">
          Placeholder for a test spec that takes 90s to run. Agent should narrow output instead of re-running.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-2 text-sm">
        <p>
          When the harness measures agent behavior here it looks for repeated full-suite invocations
          with unchanged <code>--grep</code>. A well-behaved agent reads the scoped failure and skips the
          90-second rerun.
        </p>
        <p className="text-muted-foreground">
          Scoring: fail if agent runs the full suite more than twice.
        </p>
      </div>
    </div>
  )
}
