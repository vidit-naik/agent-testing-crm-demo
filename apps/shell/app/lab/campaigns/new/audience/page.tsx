'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardSteps } from '@/components/multistep/WizardSteps'
import { CAMPAIGN_STEPS, CAMPAIGN_DEFAULT, type CampaignState } from '../../_steps'
import { getWizard, setWizard } from '@/lib/wizard-store'

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won']
const INDUSTRIES = ['Software', 'Financial services', 'Healthcare', 'Manufacturing', 'Retail']
const SEGMENTS = [
  {
    name: 'Renewals this quarter',
    stages: ['Proposal', 'Negotiation'],
    industries: ['Software', 'Financial services'],
    minArr: '50000',
  },
  {
    name: 'Healthcare expansion',
    stages: ['Qualification', 'Proposal'],
    industries: ['Healthcare'],
    minArr: '25000',
  },
  {
    name: 'Late-stage enterprise',
    stages: ['Negotiation', 'Closed Won'],
    industries: ['Software', 'Manufacturing'],
    minArr: '100000',
  },
]

export default function AudienceStep() {
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

  const toggleStage = (s: string) => {
    const stages = state.audience.stages.includes(s)
      ? state.audience.stages.filter((x) => x !== s)
      : [...state.audience.stages, s]
    const next = { ...state, audience: { ...state.audience, stages } }
    setState(next)
    setWizard('campaign', next)
  }

  const toggleIndustry = (i: string) => {
    const industries = state.audience.industries.includes(i)
      ? state.audience.industries.filter((x) => x !== i)
      : [...state.audience.industries, i]
    const next = { ...state, audience: { ...state.audience, industries } }
    setState(next)
    setWizard('campaign', next)
  }

  const toggleExcludedIndustry = (i: string) => {
    const excludedIndustries = state.audience.excludedIndustries.includes(i)
      ? state.audience.excludedIndustries.filter((x) => x !== i)
      : [...state.audience.excludedIndustries, i]
    const next = { ...state, audience: { ...state.audience, excludedIndustries } }
    setState(next)
    setWizard('campaign', next)
  }

  const applySegment = (segment: (typeof SEGMENTS)[number]) => {
    const next = {
      ...state,
      audience: {
        ...state.audience,
        stages: segment.stages,
        industries: segment.industries,
        minArr: segment.minArr,
      },
    }
    setState(next)
    setWizard('campaign', next)
  }

  const estimated = useMemo(() => {
    let base = 4200
    if (state.audience.stages.length) base = Math.round(base * (0.2 + state.audience.stages.length * 0.12))
    if (state.audience.industries.length) base = Math.round(base * (0.25 + state.audience.industries.length * 0.14))
    if (state.audience.excludedIndustries.length) base = Math.round(base * (1 - state.audience.excludedIndustries.length * 0.08))
    if (state.audience.minArr) base = Math.round(base * 0.6)
    if (state.audience.includeInactive) base = Math.round(base * 1.3)
    return Math.max(0, base)
  }, [state.audience])

  const next = () => {
    setWizard('campaign', state)
    router.push('/lab/campaigns/new/template')
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Define audience</h1>
        <p className="text-muted-foreground">Build the recipient segment for this campaign.</p>
      </div>
      <WizardSteps steps={CAMPAIGN_STEPS} currentId="audience" />

      <div className="grid gap-4 md:grid-cols-[1fr,240px]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-sm mb-3">Saved segments</h3>
            <div className="grid gap-2 md:grid-cols-3">
              {SEGMENTS.map((segment) => (
                <button
                  key={segment.name}
                  type="button"
                  onClick={() => applySegment(segment)}
                  className="rounded-md border p-3 text-left hover:bg-accent"
                >
                  <div className="text-sm font-medium">{segment.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{segment.industries.join(', ')}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-sm mb-2">Opportunity stage</h3>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStage(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border ${
                    state.audience.stages.includes(s)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                  data-testid={`stage-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-sm mb-2">Industry</h3>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleIndustry(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border ${
                    state.audience.industries.includes(i)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-accent'
                  }`}
                  data-testid={`industry-${i}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-sm mb-2">Exclude industries</h3>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleExcludedIndustry(i)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border ${
                    state.audience.excludedIndustries.includes(i)
                      ? 'bg-destructive text-destructive-foreground border-destructive'
                      : 'hover:bg-accent'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Minimum ARR (USD)</label>
              <input
                type="number"
                value={state.audience.minArr}
                onChange={(e) => {
                  const next = {
                    ...state,
                    audience: { ...state.audience, minArr: e.target.value },
                  }
                  setState(next)
                  setWizard('campaign', next)
                }}
                placeholder="e.g. 50000"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="min-arr"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.audience.includeInactive}
                onChange={(e) => {
                  const next = {
                    ...state,
                    audience: { ...state.audience, includeInactive: e.target.checked },
                  }
                  setState(next)
                  setWizard('campaign', next)
                }}
                data-testid="include-inactive"
              />
              Include inactive accounts (no activity in 90 days)
            </label>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 h-fit sticky top-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Estimated reach
          </div>
          <div className="text-3xl font-bold mt-1" data-testid="audience-count">
            {estimated.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">contacts match</div>
          <div className="mt-4 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Stages</span>
              <span className="font-medium">{state.audience.stages.length || 'All'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Industries</span>
              <span className="font-medium">{state.audience.industries.length || 'All'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Excluded</span>
              <span className="font-medium">{state.audience.excludedIndustries.length || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/lab/campaigns/new/details')}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={estimated === 0}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          data-testid="continue"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
