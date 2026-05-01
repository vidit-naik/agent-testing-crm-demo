import type { Step } from '@/components/multistep/WizardSteps'

export const CAMPAIGN_STEPS: Step[] = [
  { id: 'details', label: 'Details', href: '/lab/campaigns/new/details' },
  { id: 'audience', label: 'Audience', href: '/lab/campaigns/new/audience' },
  { id: 'template', label: 'Template', href: '/lab/campaigns/new/template' },
  { id: 'schedule', label: 'Schedule & review', href: '/lab/campaigns/new/schedule' },
]

export type CampaignState = {
  name: string
  goal: 'awareness' | 'engagement' | 'renewal' | 'winback' | ''
  channel: 'email' | 'in-app' | 'both' | ''
  audience: {
    stages: string[]
    industries: string[]
    excludedIndustries: string[]
    minArr: string
    includeInactive: boolean
  }
  template: { subject: string; body: string; preheader: string }
  schedule: { mode: 'now' | 'schedule'; sendAt: string; timezone: string; quietHours: boolean }
}

export const CAMPAIGN_DEFAULT: CampaignState = {
  name: '',
  goal: '',
  channel: '',
  audience: { stages: [], industries: [], excludedIndustries: [], minArr: '', includeInactive: false },
  template: { subject: '', body: '', preheader: '' },
  schedule: { mode: 'now', sendAt: '', timezone: 'America/Los_Angeles', quietHours: true },
}
