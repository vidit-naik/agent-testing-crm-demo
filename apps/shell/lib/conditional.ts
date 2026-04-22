export type ConditionalContext = {
  caseType: string
  priority: string
  status: string
  userRole: 'agent' | 'manager' | 'admin'
  orgTier: 'starter' | 'growth' | 'enterprise'
  region: 'us' | 'eu' | 'apac'
}

type Rule<K extends string> = {
  field: K
  label: string
  visible: (ctx: ConditionalContext) => boolean
  required?: (ctx: ConditionalContext) => boolean
}

export type FieldKey =
  | 'severity'
  | 'slaTarget'
  | 'rootCause'
  | 'escalationLevel'
  | 'complianceNote'
  | 'euDataResidency'
  | 'productArea'
  | 'customerHealthImpact'

const RULES: Rule<FieldKey>[] = [
  {
    field: 'severity',
    label: 'Severity',
    visible: (c) => c.caseType !== 'General Inquiry',
    required: (c) => c.priority === 'High' || c.priority === 'Critical',
  },
  {
    field: 'slaTarget',
    label: 'SLA target (hours)',
    visible: (c) => c.orgTier !== 'starter' && c.priority !== 'Low',
    required: (c) => c.orgTier === 'enterprise' && c.priority === 'Critical',
  },
  {
    field: 'rootCause',
    label: 'Root cause analysis',
    visible: (c) => c.status === 'In Progress' || c.status === 'Resolved',
    required: (c) => c.status === 'Resolved',
  },
  {
    field: 'escalationLevel',
    label: 'Escalation level',
    visible: (c) =>
      (c.userRole === 'manager' || c.userRole === 'admin') &&
      (c.priority === 'High' || c.priority === 'Critical'),
    required: (c) => c.userRole === 'admin' && c.priority === 'Critical',
  },
  {
    field: 'complianceNote',
    label: 'Compliance note',
    visible: (c) => c.caseType === 'Security' || c.caseType === 'Privacy',
    required: (c) => c.caseType === 'Privacy' && c.region === 'eu',
  },
  {
    field: 'euDataResidency',
    label: 'EU data residency acknowledged',
    visible: (c) => c.region === 'eu' && c.caseType !== 'General Inquiry',
    required: (c) => c.region === 'eu' && c.caseType === 'Privacy',
  },
  {
    field: 'productArea',
    label: 'Product area',
    visible: (c) => c.caseType === 'Bug' || c.caseType === 'Feature Request',
    required: (c) => c.caseType === 'Bug',
  },
  {
    field: 'customerHealthImpact',
    label: 'Customer health impact',
    visible: (c) => c.orgTier === 'enterprise' || c.userRole === 'admin',
  },
]

export function describeFieldRule(field: FieldKey): string {
  const r = RULES.find((x) => x.field === field)
  if (!r) return ''
  return `${field}: ${r.visible.toString()}`
}

export function computeVisibleFields(ctx: ConditionalContext): Record<FieldKey, { visible: boolean; required: boolean; label: string }> {
  const out = {} as Record<FieldKey, { visible: boolean; required: boolean; label: string }>
  for (const rule of RULES) {
    out[rule.field] = {
      visible: rule.visible(ctx),
      required: Boolean(rule.required?.(ctx)),
      label: rule.label,
    }
  }
  return out
}
