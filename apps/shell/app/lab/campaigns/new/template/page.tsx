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
    preheader: 'Review renewal options before your term ends.',
    body: 'Hi {firstName},\n\nYour {company} plan renews on {renewal_date}. Let us know if you’d like to talk through options or upgrade before then.\n\n— The CRM team',
  },
  {
    id: 'winback',
    name: 'Winback',
    subject: 'We miss you, {firstName}',
    preheader: 'See what changed since your last visit.',
    body: 'It’s been a while. Here’s what’s new since you last logged in.\n\nReply to this email and we’ll set up a quick refresher.',
  },
  {
    id: 'announce',
    name: 'Feature announcement',
    subject: 'New: {feature_name}',
    preheader: 'A new release is ready for your team.',
    body: 'Hi {firstName},\n\nWe shipped {feature_name} — here’s a 2-min tour. Give it a try and let us know what you think.\n\nThanks!',
  },
]

const TOKENS = ['{firstName}', '{company}', '{renewal_date}', '{feature_name}']

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
    const next = { ...state, template: { subject: tpl.subject, body: tpl.body, preheader: tpl.preheader } }
    setState(next)
    setWizard('campaign', next)
  }

  const setField = (k: 'subject' | 'body' | 'preheader', v: string) => {
    const next = { ...state, template: { ...state.template, [k]: v } }
    setState(next)
    setWizard('campaign', next)
  }

  const insertToken = (token: string) => {
    setField('body', `${state.template.body}${state.template.body ? ' ' : ''}${token}`)
  }

  const valid = state.template.subject.trim().length > 0 && state.template.body.trim().length > 0
  const wordCount = state.template.body.trim() ? state.template.body.trim().split(/\s+/).length : 0
  const warnings = [
    state.template.subject.length > 70 ? 'Subject is long' : '',
    !state.template.body.includes('{firstName}') ? 'No first name token' : '',
    wordCount > 180 ? 'Body is long' : '',
  ].filter(Boolean)

  const next = () => {
    setWizard('campaign', state)
    router.push('/lab/campaigns/new/schedule')
  }

  return (
    <div className="max-w-6xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Design your message</h1>
        <p className="text-muted-foreground">Create the campaign message and preview it for a recipient.</p>
      </div>
      <WizardSteps steps={CAMPAIGN_STEPS} currentId="template" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Templates</h2>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
                  data-testid={`template-${t.id}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={state.template.subject}
                onChange={(e) => setField('subject', e.target.value)}
                placeholder="Your subject line"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="template-subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preheader</label>
              <input
                type="text"
                value={state.template.preheader}
                onChange={(e) => setField('preheader', e.target.value)}
                placeholder="Short inbox preview"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-sm font-medium">Body</label>
                <div className="flex flex-wrap gap-1">
                  {TOKENS.map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => insertToken(token)}
                      className="rounded border px-2 py-1 text-xs hover:bg-accent"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={state.template.body}
                onChange={(e) => setField('body', e.target.value)}
                rows={12}
                placeholder="Write your message"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                data-testid="template-body"
              />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Recipient preview</h2>
            <div className="rounded-lg border bg-background p-4">
              <div className="text-xs text-muted-foreground">To: Priya Ramanathan</div>
              <div className="mt-3 font-semibold">
                {previewText(state.template.subject) || 'Subject'}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {previewText(state.template.preheader) || 'Preheader'}
              </div>
              <div className="mt-4 whitespace-pre-wrap text-sm">
                {previewText(state.template.body) || 'Message body'}
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-semibold">Quality</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Subject length</span>
                <span className="font-medium">{state.template.subject.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Word count</span>
                <span className="font-medium">{wordCount}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Warnings</span>
                <span className="font-medium">{warnings.length}</span>
              </div>
            </div>
            {warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {warnings.map((warning) => (
                  <div key={warning} className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
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

function previewText(value: string) {
  return value
    .replaceAll('{firstName}', 'Priya')
    .replaceAll('{company}', 'ACME Corp')
    .replaceAll('{renewal_date}', 'June 30')
    .replaceAll('{feature_name}', 'Pipeline Forecasting')
}
