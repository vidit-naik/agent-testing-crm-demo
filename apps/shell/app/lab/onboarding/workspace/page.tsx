'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { ONBOARDING_STEPS, ONBOARDING_DEFAULT, type OnboardingState } from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

export default function WorkspaceStep() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(ONBOARDING_DEFAULT)

  useEffect(() => {
    setState(getWizard('onboarding', ONBOARDING_DEFAULT))
  }, [])

  const next = (e: React.FormEvent) => {
    e.preventDefault()
    setWizard('onboarding', state)
    router.push('/lab/onboarding/team')
  }

  const valid = state.workspaceName.trim().length >= 2 && !!state.industry && !!state.size

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Set up your workspace</h1>
        <p className="text-muted-foreground">Tell us about your organization.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="workspace" />

      <form onSubmit={next} className="rounded-lg border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Workspace name</label>
          <input
            type="text"
            value={state.workspaceName}
            onChange={(e) => setState({ ...state, workspaceName: e.target.value })}
            placeholder="ACME Corp"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-testid="workspace-name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <select
              value={state.industry}
              onChange={(e) => setState({ ...state, industry: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              data-testid="industry"
            >
              <option value="">Select...</option>
              <option>Software</option>
              <option>Financial services</option>
              <option>Healthcare</option>
              <option>Manufacturing</option>
              <option>Retail</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team size</label>
            <select
              value={state.size}
              onChange={(e) => setState({ ...state, size: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              data-testid="size"
            >
              <option value="">Select...</option>
              <option>1-10</option>
              <option>11-50</option>
              <option>51-200</option>
              <option>201-1000</option>
              <option>1000+</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!valid}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
            data-testid="continue"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
