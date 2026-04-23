'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { ONBOARDING_STEPS, ONBOARDING_DEFAULT, type OnboardingState } from '../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function TeamStep() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>(ONBOARDING_DEFAULT)
  const [draft, setDraft] = useState({ email: '', role: 'editor' })

  useEffect(() => {
    const loaded = getWizard('onboarding', ONBOARDING_DEFAULT)
    if (!loaded.workspaceName) {
      router.replace('/lab/onboarding/workspace')
      return
    }
    setState(loaded)
  }, [router])

  const addInvite = () => {
    if (!EMAIL_RE.test(draft.email)) return
    const next = { ...state, invites: [...state.invites, { ...draft }] }
    setState(next)
    setWizard('onboarding', next)
    setDraft({ email: '', role: 'editor' })
  }

  const removeInvite = (i: number) => {
    const next = { ...state, invites: state.invites.filter((_, idx) => idx !== i) }
    setState(next)
    setWizard('onboarding', next)
  }

  const next = () => {
    setWizard('onboarding', state)
    router.push('/lab/onboarding/integrations')
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Invite your team</h1>
        <p className="text-muted-foreground">You can add more people later.</p>
      </div>
      <WizardSteps steps={ONBOARDING_STEPS} currentId="team" />

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex gap-2">
          <input
            type="email"
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            placeholder="teammate@company.com"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-testid="invite-email"
          />
          <select
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-testid="invite-role"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="button"
            onClick={addInvite}
            disabled={!EMAIL_RE.test(draft.email)}
            className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1"
            data-testid="add-invite"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {state.invites.length > 0 ? (
          <ul className="divide-y border rounded-md">
            {state.invites.map((inv, i) => (
              <li
                key={`${inv.email}-${i}`}
                className="flex items-center justify-between px-3 py-2 text-sm"
                data-testid={`invite-row-${i}`}
              >
                <span>
                  {inv.email} <span className="text-muted-foreground">· {inv.role}</span>
                </span>
                <button
                  onClick={() => removeInvite(i)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${inv.email}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
            No invites yet. Add at least one teammate or skip.
          </p>
        )}

        <div className="flex justify-between pt-2">
          <button
            onClick={() => router.push('/lab/onboarding/workspace')}
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
    </div>
  )
}
