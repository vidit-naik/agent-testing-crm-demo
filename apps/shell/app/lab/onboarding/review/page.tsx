'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { ONBOARDING_STEPS, ONBOARDING_DEFAULT, type OnboardingState } from '../_steps'
import { getWizard, clearWizard } from '@/lib/wizard-store'

export default function ReviewStep() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(ONBOARDING_DEFAULT)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const loaded = getWizard('onboarding', ONBOARDING_DEFAULT)
    if (!loaded.workspaceName) {
      router.replace('/lab/onboarding/workspace')
      return
    }
    setState(loaded)
  }, [router])

  const finish = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    clearWizard('onboarding')
    setDone(true)
    setSubmitting(false)
  }

  const connectedIntegrations = Object.entries(state.integrations)
    .filter(([, v]) => v)
    .map(([k]) => k)

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1">You&apos;re all set</h1>
        <p className="text-muted-foreground">
          <strong>{state.workspaceName}</strong> is ready to use.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          data-testid="go-to-dashboard"
        >
          Go to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Review &amp; finish</h1>
        <p className="text-muted-foreground">Confirm your choices before we create the workspace.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="review" />

      <div className="rounded-lg border bg-card divide-y">
        <ReviewRow k="Workspace" v={state.workspaceName} />
        <ReviewRow k="Industry" v={state.industry} />
        <ReviewRow k="Team size" v={state.size} />
        <ReviewRow
          k="Invites"
          v={
            state.invites.length
              ? state.invites.map((i) => `${i.email} (${i.role})`).join(', ')
              : 'None'
          }
        />
        <ReviewRow
          k="Integrations"
          v={connectedIntegrations.length ? connectedIntegrations.join(', ') : 'None'}
        />
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => router.push('/lab/onboarding/integrations')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          onClick={finish}
          disabled={submitting}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="finish-onboarding"
        >
          {submitting ? 'Creating workspace...' : 'Finish setup'}
        </button>
      </div>
    </div>
  )
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 px-4 py-3 text-sm">
      <span className="w-32 text-muted-foreground">{k}</span>
      <span className="font-medium flex-1">{v || '—'}</span>
    </div>
  )
}
