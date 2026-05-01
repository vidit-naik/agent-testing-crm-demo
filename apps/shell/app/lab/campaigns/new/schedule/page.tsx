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

  const setTimezone = (timezone: string) => {
    const next = { ...state, schedule: { ...state.schedule, timezone } }
    setState(next)
    setWizard('campaign', next)
  }

  const setQuietHours = (quietHours: boolean) => {
    const next = { ...state, schedule: { ...state.schedule, quietHours } }
    setState(next)
    setWizard('campaign', next)
  }

  const valid =
    state.schedule.mode === 'now' ||
    (state.schedule.mode === 'schedule' && !!state.schedule.sendAt)

  const checklist = [
    { label: 'Details', done: !!state.name && !!state.goal && !!state.channel },
    { label: 'Audience', done: state.audience.stages.length > 0 || state.audience.industries.length > 0 || !!state.audience.minArr },
    { label: 'Message', done: !!state.template.subject && !!state.template.body },
    { label: 'Schedule', done: valid },
  ]

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
    <div className="max-w-6xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Schedule & review</h1>
        <p className="text-muted-foreground">Confirm delivery settings before launch.</p>
      </div>
      <WizardSteps steps={CAMPAIGN_STEPS} currentId="schedule" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm">Delivery</h3>
            <div className="grid gap-2 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setSchedule('now')}
                className={`rounded-md border p-3 text-left ${
                  state.schedule.mode === 'now' ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                }`}
                data-testid="send-now"
              >
                <div className="font-medium text-sm">Send now</div>
                <div className="text-xs text-muted-foreground">Begin delivery after launch.</div>
              </button>
              <button
                type="button"
                onClick={() => setSchedule('schedule')}
                className={`rounded-md border p-3 text-left ${
                  state.schedule.mode === 'schedule'
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
                data-testid="send-schedule"
              >
                <div className="font-medium text-sm">Schedule</div>
                <div className="text-xs text-muted-foreground">Use a future delivery time.</div>
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
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Timezone</span>
                <select
                  value={state.schedule.timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="Europe/London">London</option>
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={state.schedule.quietHours}
                  onChange={(e) => setQuietHours(e.target.checked)}
                />
                Respect quiet hours
              </label>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 space-y-2">
            <h3 className="font-semibold text-sm mb-2">Review</h3>
            <ReviewRow k="Name" v={state.name} />
            <ReviewRow k="Goal" v={state.goal} />
            <ReviewRow k="Channel" v={state.channel} />
            <ReviewRow
              k="Audience"
              v={`${state.audience.stages.length ? state.audience.stages.join(', ') : 'Any stage'} · ${
                state.audience.industries.length
                  ? state.audience.industries.join(', ')
                  : 'Any industry'
              }`}
            />
            <ReviewRow k="Subject" v={state.template.subject} />
            <ReviewRow k="Preheader" v={state.template.preheader} />
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Launch checklist</h2>
            <div className="mt-4 space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.done ? 'Ready' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Delivery summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <ReviewRow k="Mode" v={state.schedule.mode === 'now' ? 'Send now' : 'Scheduled'} />
              <ReviewRow k="Timezone" v={state.schedule.timezone} />
              <ReviewRow k="Quiet hours" v={state.schedule.quietHours ? 'On' : 'Off'} />
            </div>
          </section>
        </aside>
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
