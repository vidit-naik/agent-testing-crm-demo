'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
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

  const connectedIntegrations = useMemo(
    () =>
      Object.entries(state.integrations)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key),
    [state.integrations]
  )

  const readiness = [
    { label: 'Workspace profile', done: !!state.workspaceName && !!state.industry && !!state.size },
    { label: 'Team invites', done: state.invites.length > 0 },
    { label: 'Integrations', done: connectedIntegrations.length > 0 },
    { label: 'Security defaults', done: state.security.auditLog },
  ]

  const finish = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    clearWizard('onboarding')
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Workspace ready</h1>
          <p className="text-muted-foreground"><strong>{state.workspaceName}</strong> is ready for the team.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Result label="Plan" value={state.plan} />
          <Result label="Invites" value={String(state.invites.length)} />
          <Result label="Integrations" value={String(connectedIntegrations.length)} />
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Review setup</h1>
        <p className="text-muted-foreground">Confirm workspace settings before launch.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="review" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Workspace</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ReviewTile label="Name" value={state.workspaceName} />
              <ReviewTile label="Industry" value={state.industry} />
              <ReviewTile label="Team size" value={state.size} />
              <ReviewTile label="Region" value={state.region} />
              <ReviewTile label="Plan" value={state.plan} />
              <ReviewTile label="Departments" value={state.departments.length ? state.departments.join(', ') : 'None'} />
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Team</h2>
            </div>
            {state.invites.length ? (
              <div className="divide-y rounded-md border">
                {state.invites.map((invite) => (
                  <div key={invite.email} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="font-medium">{invite.email}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">{invite.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending invites.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Launch checklist</h2>
            <div className="mt-4 space-y-3">
              {readiness.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.done ? 'Ready' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Security</h2>
            </div>
            <div className="space-y-3 text-sm">
              <Summary label="SSO" value={state.security.sso ? 'On' : 'Off'} />
              <Summary label="Audit log" value={state.security.auditLog ? 'On' : 'Off'} />
              <Summary label="Data residency" value={state.security.dataResidency ? 'On' : 'Off'} />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Integrations</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {connectedIntegrations.length ? (
                connectedIntegrations.map((integration) => (
                  <span key={integration} className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
                    {integration}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None connected</span>
              )}
            </div>
          </section>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/lab/onboarding/integrations')}
              className="flex-1 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Back
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={submitting}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Finish'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ReviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium capitalize">{value || '-'}</div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-2xl font-bold capitalize">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
