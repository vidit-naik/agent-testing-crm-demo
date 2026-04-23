'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { CAMPAIGN_STEPS, CAMPAIGN_DEFAULT, type CampaignState } from '../../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const GOALS: { value: CampaignState['goal']; label: string; desc: string }[] = [
  { value: 'awareness', label: 'Awareness', desc: 'Introduce new features or updates' },
  { value: 'engagement', label: 'Engagement', desc: 'Nudge inactive users back' },
  { value: 'renewal', label: 'Renewal', desc: 'Prompt customers to renew' },
  { value: 'winback', label: 'Winback', desc: 'Re-engage churned customers' },
]

export default function DetailsStep() {
  const router = useRouter()
  const [state, setState] = useState<CampaignState>(CAMPAIGN_DEFAULT)

  useEffect(() => {
    setState(getWizard('campaign', CAMPAIGN_DEFAULT))
  }, [])

  const valid = state.name.trim().length >= 3 && !!state.goal && !!state.channel

  const next = (e: React.FormEvent) => {
    e.preventDefault()
    setWizard('campaign', state)
    router.push('/lab/campaigns/new/audience')
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">New campaign</h1>
        <p className="text-muted-foreground">Give your campaign a name and pick a goal.</p>
      </div>
      <WizardSteps steps={CAMPAIGN_STEPS} currentId="details" />

      <form onSubmit={next} className="rounded-lg border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Campaign name</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            placeholder="Q4 renewal push"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-testid="campaign-name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setState({ ...state, goal: g.value })}
                className={`text-left rounded-md border p-3 transition ${
                  state.goal === g.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
                data-testid={`goal-${g.value}`}
                data-active={state.goal === g.value}
              >
                <div className="font-medium text-sm">{g.label}</div>
                <div className="text-xs text-muted-foreground">{g.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Channel</label>
          <div className="flex gap-2">
            {(['email', 'in-app', 'both'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setState({ ...state, channel: ch })}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                  state.channel === ch ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
                data-testid={`channel-${ch}`}
              >
                {ch === 'in-app' ? 'In-app' : ch === 'both' ? 'Email + In-app' : 'Email'}
              </button>
            ))}
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
