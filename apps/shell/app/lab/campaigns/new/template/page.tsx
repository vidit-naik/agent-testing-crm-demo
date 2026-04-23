'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { CAMPAIGN_STEPS, CAMPAIGN_DEFAULT, type CampaignState } from '../../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const TEMPLATES = [
  {
    id: 'renewal',
    name: 'Renewal nudge',
    subject: 'Your {company} subscription renews soon',
    body: 'Hi {firstName},\n\nYour {company} plan renews on {renewal_date}. Let us know if you’d like to talk through options or upgrade before then.\n\n— The CRM team',
  },
  {
    id: 'winback',
    name: 'Winback',
    subject: 'We miss you, {firstName}',
    body: 'It’s been a while. Here’s what’s new since you last logged in.\n\nReply to this email and we’ll set up a quick refresher.',
  },
  {
    id: 'announce',
    name: 'Feature announcement',
    subject: 'New: {feature_name}',
    body: 'Hi {firstName},\n\nWe shipped {feature_name} — here’s a 2-min tour. Give it a try and let us know what you think.\n\nThanks!',
  },
]

export default function TemplateStep() {
  const router = useRouter()
  const [state, setState] = useState<CampaignState>(CAMPAIGN_DEFAULT)

  useEffect(() => {
    const loaded = getWizard('campaign', CAMPAIGN_DEFAULT)
    if (!loaded.name) {
      router.replace('/lab/campaigns/new/details')
      return
    }
    setState(loaded)
  }, [router])

  const applyTemplate = (id: string) => {
    const tpl = TEMPLATES.find((t) => t.id === id)
    if (!tpl) return
    const next = { ...state, template: { subject: tpl.subject, body: tpl.body } }
    setState(next)
    setWizard('campaign', next)
  }

  const setField = (k: 'subject' | 'body', v: string) => {
    const next = { ...state, template: { ...state.template, [k]: v } }
    setState(next)
    setWizard('campaign', next)
  }

  const valid = state.template.subject.trim().length > 0 && state.template.body.trim().length > 0

  const next = () => {
    setWizard('campaign', state)
    router.push('/lab/campaigns/new/schedule')
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Design your message</h1>
        <p className="text-muted-foreground">
          Start from a template or write your own.
          <code className="mx-1 text-xs bg-muted px-1 py-0.5 rounded">{'{firstName}'}</code>
          and
          <code className="mx-1 text-xs bg-muted px-1 py-0.5 rounded">{'{company}'}</code>
          get replaced per recipient.
        </p>
      </div>
      <WizardSteps steps={CAMPAIGN_STEPS} currentId="template" />

      <div className="flex gap-2 flex-wrap">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => applyTemplate(t.id)}
            className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
            data-testid={`template-${t.id}`}
          >
            Use &ldquo;{t.name}&rdquo;
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            value={state.template.subject}
            onChange={(e) => setField('subject', e.target.value)}
            placeholder="Your subject line..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            data-testid="template-subject"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea
            value={state.template.body}
            onChange={(e) => setField('body', e.target.value)}
            rows={10}
            placeholder="Write your message..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            data-testid="template-body"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/lab/campaigns/new/audience')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={!valid}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="continue"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
