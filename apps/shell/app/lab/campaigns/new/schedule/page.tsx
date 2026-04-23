'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { CAMPAIGN_STEPS, CAMPAIGN_DEFAULT, type CampaignState } from '../../_steps'
import { getWizard, setWizard, clearWizard } from '@/lib/wizard-store'

export default function ScheduleStep() {
  const router = useRouter()
  const [state, setState] = useState<CampaignState>(CAMPAIGN_DEFAULT)
  const [launching, setLaunching] = useState(false)
  const [launched, setLaunched] = useState(false)

  useEffect(() => {
    const loaded = getWizard('campaign', CAMPAIGN_DEFAULT)
    if (!loaded.name) {
      router.replace('/lab/campaigns/new/details')
      return
    }
    setState(loaded)
  }, [router])

  const setSchedule = (mode: 'now' | 'schedule') => {
    const next = { ...state, schedule: { ...state.schedule, mode } }
    setState(next)
    setWizard('campaign', next)
  }

  const setSendAt = (sendAt: string) => {
    const next = { ...state, schedule: { ...state.schedule, sendAt } }
    setState(next)
    setWizard('campaign', next)
  }

  const valid =
    state.schedule.mode === 'now' ||
    (state.schedule.mode === 'schedule' && !!state.schedule.sendAt)

  const launch = async () => {
    setLaunching(true)
    await new Promise((r) => setTimeout(r, 900))
    clearWizard('campaign')
    setLaunched(true)
    setLaunching(false)
  }

  if (launched) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1">Campaign launched</h1>
        <p className="text-muted-foreground">
          <strong>{state.name}</strong>{' '}
          {state.schedule.mode === 'now' ? 'is sending now' : `is scheduled for ${state.schedule.sendAt}`}.
        </p>
        <button
          onClick={() => router.push('/lab/campaigns')}
          className="mt-6 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          Back to campaigns
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Schedule & review</h1>
        <p className="text-muted-foreground">Send now or pick a future time.</p>
      </div>
      <WizardSteps steps={CAMPAIGN_STEPS} currentId="schedule" />

      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-sm">When to send</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSchedule('now')}
            className={`flex-1 rounded-md border p-3 text-left ${
              state.schedule.mode === 'now' ? 'border-primary bg-primary/5' : 'hover:bg-accent'
            }`}
            data-testid="send-now"
          >
            <div className="font-medium text-sm">Send now</div>
            <div className="text-xs text-muted-foreground">Launch as soon as you click below.</div>
          </button>
          <button
            onClick={() => setSchedule('schedule')}
            className={`flex-1 rounded-md border p-3 text-left ${
              state.schedule.mode === 'schedule'
                ? 'border-primary bg-primary/5'
                : 'hover:bg-accent'
            }`}
            data-testid="send-schedule"
          >
            <div className="font-medium text-sm">Schedule</div>
            <div className="text-xs text-muted-foreground">Pick a future time.</div>
          </button>
        </div>
        {state.schedule.mode === 'schedule' && (
          <input
            type="datetime-local"
            value={state.schedule.sendAt}
            onChange={(e) => setSendAt(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-testid="send-at"
          />
        )}
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-2">
        <h3 className="font-semibold text-sm mb-2">Review</h3>
        <ReviewRow k="Name" v={state.name} />
        <ReviewRow k="Goal" v={state.goal} />
        <ReviewRow k="Channel" v={state.channel} />
        <ReviewRow
          k="Audience"
          v={`${state.audience.stages.length ? state.audience.stages.join(', ') : 'any stage'} · ${
            state.audience.industries.length
              ? state.audience.industries.join(', ')
              : 'any industry'
          }`}
        />
        <ReviewRow k="Subject" v={state.template.subject} />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/lab/campaigns/new/template')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          onClick={launch}
          disabled={!valid || launching}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="launch-campaign"
        >
          {launching ? 'Launching...' : state.schedule.mode === 'now' ? 'Launch now' : 'Schedule campaign'}
        </button>
      </div>
    </div>
  )
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-24 text-muted-foreground">{k}</span>
      <span className="font-medium flex-1">{v || '—'}</span>
    </div>
  )
}
