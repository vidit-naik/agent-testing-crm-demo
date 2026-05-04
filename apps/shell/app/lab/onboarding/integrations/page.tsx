'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, CheckCircle2, Cloud, Mail, MessageSquare, Settings2 } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { ONBOARDING_STEPS, ONBOARDING_DEFAULT, type OnboardingState } from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const INTEGRATIONS = [
  { key: 'slack' as const, label: 'Slack', icon: MessageSquare, desc: 'Post deal updates to team channels', category: 'Collaboration' },
  { key: 'gmail' as const, label: 'Gmail', icon: Mail, desc: 'Sync customer email conversations', category: 'Email' },
  { key: 'calendar' as const, label: 'Google Calendar', icon: Calendar, desc: 'Attach meetings to activity timelines', category: 'Calendar' },
  { key: 'salesforce' as const, label: 'Salesforce', icon: Cloud, desc: 'Sync accounts, contacts, and opportunities', category: 'CRM' },
]

export default function IntegrationsStep() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(ONBOARDING_DEFAULT)
  const [syncMode, setSyncMode] = useState('two-way')
  const [frequency, setFrequency] = useState('15 min')

  useEffect(() => {
    const loaded = getWizard('onboarding', ONBOARDING_DEFAULT)
    if (!loaded.workspaceName) {
      router.replace('/lab/onboarding/workspace')
      return
    }
    setState(loaded)
  }, [router])

  const connectedCount = useMemo(
    () => Object.values(state.integrations).filter(Boolean).length,
    [state.integrations]
  )

  const toggle = (key: keyof OnboardingState['integrations']) => {
    const nextIntegr = { ...state.integrations, [key]: !state.integrations[key] }
    const next = { ...state, integrations: nextIntegr }
    setState(next)
    setWizard('onboarding', next)
  }

  const next = () => {
    setWizard('onboarding', state)
    router.push('/lab/onboarding/review')
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Connect integrations</h1>
        <p className="text-muted-foreground">Link the systems your team uses every day.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="integrations" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Available integrations</h2>
            <p className="text-sm text-muted-foreground">{connectedCount} connected</p>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {INTEGRATIONS.map((integration) => {
              const Icon = integration.icon
              const connected = state.integrations[integration.key]
              return (
                <article
                  key={integration.key}
                  className={`rounded-lg border p-4 ${connected ? 'border-primary bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium">{integration.label}</h3>
                        {connected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{integration.category}</div>
                      <p className="mt-2 text-sm text-muted-foreground">{integration.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(integration.key)}
                    className={`mt-4 w-full rounded-md px-3 py-2 text-sm font-medium ${
                      connected
                        ? 'border border-emerald-200 bg-emerald-100 text-emerald-800'
                        : 'border border-input hover:bg-accent'
                    }`}
                  >
                    {connected ? 'Connected' : 'Connect'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Sync settings</h2>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Sync mode</span>
                <select
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="two-way">Two-way</option>
                  <option value="import-only">Import only</option>
                  <option value="export-only">Export only</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Frequency</span>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Real time</option>
                  <option>15 min</option>
                  <option>Hourly</option>
                  <option>Daily</option>
                </select>
              </label>
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Connection health</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Connected" value={String(connectedCount)} />
              <Summary label="Sync mode" value={syncMode} />
              <Summary label="Frequency" value={frequency} />
            </div>
          </section>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/lab/onboarding/team')}
              className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Back
            </button>
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Continue
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  )
}
