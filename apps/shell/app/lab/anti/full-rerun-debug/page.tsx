'use client'

import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

export default function FullRerunDebugPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Full rerun debug"
        subtitle="This is a meta-page. It represents the class of tests whose full suite takes 90s to run. Re-running the whole thing to debug one failure is the anti-pattern."
        route="/lab/anti/full-rerun-debug"
        patterns={['anti-pattern', 'narrow output', 'debug discipline']}
      />

      <ScenarioPanel
        story={
          <>
            A test in a 90-second suite fails. The default reflex is{' '}
            <code className="font-mono text-xs">npx playwright test</code> again — another 90
            seconds. Correct reflex: read the <code className="font-mono text-xs">--grep</code>-narrowed
            output, or <code className="font-mono text-xs">pw_eval</code> the specific step.
          </>
        }
        steps={[
          'Read the failing test name from the previous output',
          <>
            Re-run with <code className="font-mono text-xs">--grep &quot;failing name&quot;</code>
          </>,
          'Or use pw_eval to interactively probe the step',
          'Do NOT re-run the full suite to "see where it fails"',
        ]}
        success={[
          'Repeat invocations all use --grep or pw_eval, not full-suite runs.',
          'Full-suite re-invocations ≤ 2 across the entire session.',
          'Timeout is not bumped to let full suite complete faster.',
        ]}
        gotcha={
          <>
            The harness here scores agent behavior on real test runs. If you&apos;re arriving at
            this page from an agent session, the scoring is already watching the commands you
            execute on the shell.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-5 text-sm space-y-2">
        <div className="font-semibold">Example narrowing</div>
        <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto">
          {`# Instead of:
npx playwright test

# Use:
npx playwright test --grep "opportunities wizard > saves a deal"
# or
pw_eval "await expect(page.getByRole('dialog')).toBeVisible()"`}
        </pre>
      </div>
    </div>
  )
}
