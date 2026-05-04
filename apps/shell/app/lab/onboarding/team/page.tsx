'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MailPlus, Plus, ShieldCheck, UserCheck, X } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { ONBOARDING_STEPS, ONBOARDING_DEFAULT, type OnboardingState } from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLE_DETAILS: Record<string, string> = {
  admin: 'Manage billing, users, data, and security',
  editor: 'Create and update records',
  viewer: 'Read-only access',
}

export default function TeamStep() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(ONBOARDING_DEFAULT)
  const [draft, setDraft] = useState({ email: '', role: 'editor' })
  const [bulk, setBulk] = useState('')

  useEffect(() => {
    const loaded = getWizard('onboarding', ONBOARDING_DEFAULT)
    if (!loaded.workspaceName) {
      router.replace('/lab/onboarding/workspace')
      return
    }
    setState(loaded)
  }, [router])

  const roleCounts = useMemo(
    () =>
      state.invites.reduce<Record<string, number>>((acc, invite) => {
        acc[invite.role] = (acc[invite.role] || 0) + 1
        return acc
      }, {}),
    [state.invites]
  )

  const addInvite = () => {
    if (!EMAIL_RE.test(draft.email)) return
    if (state.invites.some((invite) => invite.email.toLowerCase() === draft.email.toLowerCase())) return
    const next = { ...state, invites: [...state.invites, { ...draft }] }
    setState(next)
    setWizard('onboarding', next)
    setDraft({ email: '', role: 'editor' })
  }

  const importBulk = () => {
    const incoming = bulk
      .split(/[\n,]/)
      .map((email) => email.trim())
      .filter((email) => EMAIL_RE.test(email))
      .filter((email) => !state.invites.some((invite) => invite.email.toLowerCase() === email.toLowerCase()))
      .map((email) => ({ email, role: 'viewer' }))
    if (!incoming.length) return
    const next = { ...state, invites: [...state.invites, ...incoming] }
    setState(next)
    setWizard('onboarding', next)
    setBulk('')
  }

  const removeInvite = (i: number) => {
    const next = { ...state, invites: state.invites.filter((_, idx) => idx !== i) }
    setState(next)
    setWizard('onboarding', next)
  }

  const updateRole = (index: number, role: string) => {
    const next = {
      ...state,
      invites: state.invites.map((invite, idx) => (idx === index ? { ...invite, role } : invite)),
    }
    setState(next)
    setWizard('onboarding', next)
  }

  const next = () => {
    setWizard('onboarding', state)
    router.push('/lab/onboarding/integrations')
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Invite your team</h1>
        <p className="text-muted-foreground">Add teammates and assign access levels for {state.workspaceName}.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="team" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <MailPlus className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Single invite</h2>
            </div>
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_150px_auto]">
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="teammate@company.com"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <select
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="button"
                onClick={addInvite}
                disabled={!EMAIL_RE.test(draft.email)}
                className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-3 font-semibold">Bulk invite</h2>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={4}
              placeholder="alex@example.com, sam@example.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={importBulk}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Add as viewers
              </button>
            </div>
          </section>

          <section className="rounded-lg border bg-card">
            <div className="border-b p-4">
              <h2 className="font-semibold">Pending invites</h2>
              <p className="text-sm text-muted-foreground">{state.invites.length} teammates</p>
            </div>
            {state.invites.length > 0 ? (
              <ul className="divide-y">
                {state.invites.map((invite, i) => (
                  <li key={`${invite.email}-${i}`} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{invite.email}</div>
                      <div className="text-xs text-muted-foreground">{ROLE_DETAILS[invite.role]}</div>
                    </div>
                    <select
                      value={invite.role}
                      onChange={(e) => updateRole(i, e.target.value)}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeInvite(i)}
                      className="inline-flex items-center justify-center rounded-md border p-2 hover:bg-accent"
                      aria-label={`Remove ${invite.email}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">No pending invites</div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Access mix</h2>
            </div>
            <div className="space-y-3 text-sm">
              <Summary label="Admins" value={String(roleCounts.admin || 0)} />
              <Summary label="Editors" value={String(roleCounts.editor || 0)} />
              <Summary label="Viewers" value={String(roleCounts.viewer || 0)} />
            </div>
          </section>
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Security</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Admins can manage billing and security. Editors can update records. Viewers have read-only access.
            </p>
          </section>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/lab/onboarding/workspace')}
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
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
