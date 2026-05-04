import type { Step } from '@/components/multistep/WizardSteps'

export const ONBOARDING_STEPS: Step[] = [
  { id: 'workspace', label: 'Workspace', href: '/lab/onboarding/workspace' },
  { id: 'team', label: 'Team', href: '/lab/onboarding/team' },
  { id: 'integrations', label: 'Integrations', href: '/lab/onboarding/integrations' },
  { id: 'review', label: 'Review', href: '/lab/onboarding/review' },
]

export type OnboardingState = {
  workspaceName: string
  industry: string
  size: string
  region: string
  plan: string
  departments: string[]
  invites: { email: string; role: string }[]
  integrations: { slack: boolean; gmail: boolean; calendar: boolean; salesforce: boolean }
  security: { sso: boolean; auditLog: boolean; dataResidency: boolean }
}

export const ONBOARDING_DEFAULT: OnboardingState = {
  workspaceName: '',
  industry: '',
  size: '',
  region: '',
  plan: 'growth',
  departments: [],
  invites: [],
  integrations: { slack: false, gmail: false, calendar: false, salesforce: false },
  security: { sso: false, auditLog: true, dataResidency: false },
}
