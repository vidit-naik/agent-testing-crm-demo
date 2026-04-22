'use client'

import { useState } from 'react'
import { PageHeader, ScenarioPanel } from '@/components/lab/ScenarioCard'

export default function TimeoutBumpPage() {
  const [clicked, setClicked] = useState<'decoy' | 'real' | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timeout bump"
        subtitle="Two Submit buttons. Both resolve in 200ms. Only one does the right thing. Fix is to change the selector, not the timeout."
        route="/lab/anti/timeout-bump"
        patterns={['anti-pattern', 'wrong selector', 'timeout discipline']}
      />

      <ScenarioPanel
        story={
          <>
            When a click times out, tired agents bump from 10s → 15s → 30s. That never helps when
            the real fix is &ldquo;pick a different button.&rdquo; Both buttons below resolve fast;
            only the second one is wired to submit the deal.
          </>
        }
        steps={[
          <>
            Try clicking the button whose <code className="font-mono text-xs">aria-label=&quot;Submit&quot;</code>
          </>,
          'Notice the state shows "decoy" — wrong click',
          <>
            Switch selector to the one tagged{' '}
            <code className="font-mono text-xs">data-testid=&quot;real-submit&quot;</code>
          </>,
          'Confirm state becomes "real"',
        ]}
        success={[
          'When the first selector is wrong, the test re-examines the DOM, not the timeout.',
          'Final passing test targets data-testid, not aria-label.',
          'No timeout > default is set.',
        ]}
        gotcha={
          <>
            aria-label looks authoritative. It isn&apos;t always. When both candidates resolve fast,
            a wrong click succeeds silently and the downstream assertion fails — the agent blames
            timing, not selector choice.
          </>
        }
      />

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setClicked('decoy')}
            aria-label="Submit"
            data-primary="false"
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Submit (decoy)
          </button>
          <button
            onClick={() => setClicked('real')}
            data-testid="real-submit"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            Real Submit
          </button>
        </div>

        <div
          className={`rounded-md border p-3 text-sm ${
            clicked === 'real'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : clicked === 'decoy'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-dashed bg-muted/30 text-muted-foreground'
          }`}
          data-click-state={clicked ?? 'none'}
        >
          {clicked === 'real'
            ? '✓ Real submit clicked. Deal submitted successfully.'
            : clicked === 'decoy'
            ? '✗ Decoy clicked. Nothing happened — re-select.'
            : 'No click yet.'}
        </div>
      </div>
    </div>
  )
}
