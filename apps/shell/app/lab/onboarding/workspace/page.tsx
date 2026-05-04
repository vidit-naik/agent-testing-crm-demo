'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CheckCircle2, Shield, Users } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { ONBOARDING_STEPS, ONBOARDING_DEFAULT, type OnboardingState } from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const DEPARTMENTS = ['Sales', 'Success', 'Marketing', 'Operations', 'Finance']
const PLANS = [
  { id: 'starter', label: 'Starter', seats: 'Up to 10 seats', price: '$49/mo' },
  { id: 'growth', label: 'Growth', seats: 'Up to 50 seats', price: '$149/mo' },
  { id: 'enterprise', label: 'Enterprise', seats: 'Unlimited seats', price: 'Custom' },
]

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

  const valid = state.workspaceName.trim().length >= 2 && !!state.industry && !!state.size && !!state.region
  const setupScore = useMemo(() => {
    let score = 0
    if (state.workspaceName) score += 20
    if (state.industry) score += 20
    if (state.size) score += 20
    if (state.region) score += 20
    if (state.departments.length) score += 20
    return score
  }, [state])

  const toggleDepartment = (department: string) => {
    const departments = state.departments.includes(department)
      ? state.departments.filter((item) => item !== department)
      : [...state.departments, department]
    setState({ ...state, departments })
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Set up your workspace</h1>
        <p className="text-muted-foreground">Create the account profile and choose the starting plan.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="workspace" />

      <form onSubmit={next} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Organization</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block font-medium">Workspace name</span>
                <input
                  type="text"
                  value={state.workspaceName}
                  onChange={(e) => setState({ ...state, workspaceName: e.target.value })}
                  placeholder="ACME Corp"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Industry</span>
                <select
                  value={state.industry}
                  onChange={(e) => setState({ ...state, industry: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option>Software</option>
                  <option>Financial services</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Team size</span>
                <select
                  value={state.size}
                  onChange={(e) => setState({ ...state, size: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-1000</option>
                  <option>1000+</option>
                </select>
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block font-medium">Primary region</span>
                <select
                  value={state.region}
                  onChange={(e) => setState({ ...state, region: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="us">United States</option>
                  <option value="eu">European Union</option>
                  <option value="apac">Asia Pacific</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Departments</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((department) => (
                <button
                  key={department}
                  type="button"
                  onClick={() => toggleDepartment(department)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    state.departments.includes(department)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {department}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 font-semibold">Plan</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setState({ ...state, plan: plan.id })}
                  className={`rounded-lg border p-4 text-left hover:bg-accent ${
                    state.plan === plan.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="font-semibold">{plan.label}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{plan.seats}</div>
                  <div className="mt-3 text-sm font-medium">{plan.price}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Readiness</h2>
            <div className="mt-3 text-3xl font-bold">{setupScore}%</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${setupScore}%` }} />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Security defaults</h2>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['sso', 'Single sign-on'],
                ['auditLog', 'Audit log'],
                ['dataResidency', 'Regional data residency'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <input
                    type="checkbox"
                    checked={state.security[key as keyof OnboardingState['security']]}
                    onChange={(e) =>
                      setState({
                        ...state,
                        security: { ...state.security, [key]: e.target.checked },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Profile</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Summary label="Plan" value={state.plan} />
              <Summary label="Region" value={state.region || 'Not selected'} />
              <Summary label="Departments" value={state.departments.length ? String(state.departments.length) : 'None'} />
            </div>
          </section>
          <button
            type="submit"
            disabled={!valid}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Continue
          </button>
        </aside>
      </form>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1 font-medium capitalize">
        {value !== 'Not selected' && value !== 'None' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
        {value}
      </span>
    </div>
  )
}
