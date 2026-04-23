'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Mail, Calendar, Cloud } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { ONBOARDING_STEPS, ONBOARDING_DEFAULT, type OnboardingState } from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const INTEGRATIONS = [
  { key: 'slack' as const, label: 'Slack', icon: MessageSquare, desc: 'Get deal updates in your channels' },
  { key: 'gmail' as const, label: 'Gmail', icon: Mail, desc: 'Sync emails to contacts automatically' },
  { key: 'calendar' as const, label: 'Google Calendar', icon: Calendar, desc: 'Pull meetings into activity timeline' },
  { key: 'salesforce' as const, label: 'Salesforce', icon: Cloud, desc: 'Two-way sync for accounts and opportunities' },
]

export default function IntegrationsStep() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(ONBOARDING_DEFAULT)

  useEffect(() => {
    const loaded = getWizard('onboarding', ONBOARDING_DEFAULT)
    if (!loaded.workspaceName) {
      router.replace('/lab/onboarding/workspace')
      return
    }
    setState(loaded)
  }, [router])

  const toggle = (k: keyof OnboardingState['integrations']) => {
    const nextIntegr = { ...state.integrations, [k]: !state.integrations[k] }
    const next = { ...state, integrations: nextIntegr }
    setState(next)
    setWizard('onboarding', next)
  }

  const next = () => {
    setWizard('onboarding', state)
    router.push('/lab/onboarding/review')
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Connect integrations</h1>
        <p className="text-muted-foreground">Pick the tools you already use. All optional.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="integrations" />

      <div className="rounded-lg border bg-card p-4 space-y-2">
        {INTEGRATIONS.map((int) => {
          const Icon = int.icon
          const connected = state.integrations[int.key]
          return (
            <div
              key={int.key}
              className="flex items-center gap-3 p-3 rounded-md border"
              data-integration={int.key}
              data-connected={connected}
            >
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{int.label}</div>
                <div className="text-xs text-muted-foreground">{int.desc}</div>
              </div>
              <button
                onClick={() => toggle(int.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  connected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'border border-input hover:bg-accent'
                }`}
                data-testid={`toggle-${int.key}`}
              >
                {connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => router.push('/lab/onboarding/team')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          onClick={next}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          data-testid="continue"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
