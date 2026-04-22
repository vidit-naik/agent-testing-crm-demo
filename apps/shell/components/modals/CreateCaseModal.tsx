'use client'

import { useEffect, useMemo, useState } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'
import { computeVisibleFields, describeFieldRule, type ConditionalContext, type FieldKey } from '@/lib/conditional'

const CASE_TYPES = ['General Inquiry', 'Bug', 'Feature Request', 'Security', 'Privacy']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['New', 'In Progress', 'Waiting', 'Resolved', 'Closed']

export function CreateCaseModal() {
  const { closeModal, addToast, triggerRefresh } = useApp()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [debug, setDebug] = useState(false)

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    caseType: 'General Inquiry',
    userRole: 'agent' as 'agent' | 'manager' | 'admin',
    orgTier: 'growth' as 'starter' | 'growth' | 'enterprise',
    region: 'us' as 'us' | 'eu' | 'apac',
    owner: '',
    account_id: '',
    contact_id: '',
    severity: 'S3',
    slaTarget: '',
    rootCause: '',
    escalationLevel: '',
    complianceNote: '',
    euDataResidency: false,
    productArea: '',
    customerHealthImpact: '',
  })

  useEffect(() => {
    setDebug(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1')
  }, [])

  useEffect(() => {
    fetch('/api/accounts').then((r) => r.json()).then((d) => setAccounts(d || [])).catch(() => {})
    fetch('/api/contacts').then((r) => r.json()).then((d) => setContacts(d || [])).catch(() => {})
  }, [])

  const ctx: ConditionalContext = useMemo(
    () => ({
      caseType: formData.caseType,
      priority: formData.priority,
      status: formData.status,
      userRole: formData.userRole,
      orgTier: formData.orgTier,
      region: formData.region,
    }),
    [formData.caseType, formData.priority, formData.status, formData.userRole, formData.orgTier, formData.region]
  )

  const fields = useMemo(() => computeVisibleFields(ctx), [ctx])

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('failed')
      addToast('Case created', 'success')
      closeModal()
      triggerRefresh()
    } catch {
      addToast('Failed to create case', 'error')
    } finally {
      setLoading(false)
    }
  }

  const cond = (field: FieldKey, node: React.ReactNode) => {
    const rule = fields[field]
    if (!rule.visible) return null
    const props = debug ? { 'data-conditional-rule': describeFieldRule(field) } : {}
    return (
      <div {...props}>
        {node}
        {rule.required && <p className="text-xs text-destructive mt-1">Required</p>}
      </div>
    )
  }

  return (
    <Modal isOpen onClose={closeModal} title="Create New Case" size="xl">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Subject"
            required
            value={formData.subject}
            onChange={(e) => set('subject', e.target.value)}
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Case type"
              value={formData.caseType}
              onChange={(e) => set('caseType', e.target.value)}
              options={CASE_TYPES.map((s) => ({ value: s, label: s }))}
            />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => set('priority', e.target.value)}
              options={PRIORITIES.map((s) => ({ value: s, label: s }))}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => set('status', e.target.value)}
              options={STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="User role"
              value={formData.userRole}
              onChange={(e) => set('userRole', e.target.value as any)}
              options={[
                { value: 'agent', label: 'Agent' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <Select
              label="Org tier"
              value={formData.orgTier}
              onChange={(e) => set('orgTier', e.target.value as any)}
              options={[
                { value: 'starter', label: 'Starter' },
                { value: 'growth', label: 'Growth' },
                { value: 'enterprise', label: 'Enterprise' },
              ]}
            />
            <Select
              label="Region"
              value={formData.region}
              onChange={(e) => set('region', e.target.value as any)}
              options={[
                { value: 'us', label: 'US' },
                { value: 'eu', label: 'EU' },
                { value: 'apac', label: 'APAC' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {cond(
              'severity',
              <Select
                label={fields.severity.label}
                value={formData.severity}
                onChange={(e) => set('severity', e.target.value)}
                options={['S1', 'S2', 'S3', 'S4'].map((s) => ({ value: s, label: s }))}
              />
            )}
            {cond(
              'slaTarget',
              <Input
                label={fields.slaTarget.label}
                type="number"
                value={formData.slaTarget}
                onChange={(e) => set('slaTarget', e.target.value)}
              />
            )}
            {cond(
              'productArea',
              <Select
                label={fields.productArea.label}
                value={formData.productArea}
                onChange={(e) => set('productArea', e.target.value)}
                options={[
                  { value: '', label: 'Select area' },
                  { value: 'frontend', label: 'Frontend' },
                  { value: 'api', label: 'API' },
                  { value: 'billing', label: 'Billing' },
                  { value: 'mobile', label: 'Mobile' },
                ]}
              />
            )}
            {cond(
              'escalationLevel',
              <Select
                label={fields.escalationLevel.label}
                value={formData.escalationLevel}
                onChange={(e) => set('escalationLevel', e.target.value)}
                options={[
                  { value: '', label: 'Not escalated' },
                  { value: 'l2', label: 'L2' },
                  { value: 'l3', label: 'L3' },
                  { value: 'executive', label: 'Executive' },
                ]}
              />
            )}
          </div>

          {cond(
            'rootCause',
            <Textarea
              label={fields.rootCause.label}
              value={formData.rootCause}
              onChange={(e) => set('rootCause', e.target.value)}
              rows={2}
            />
          )}

          {cond(
            'complianceNote',
            <Textarea
              label={fields.complianceNote.label}
              value={formData.complianceNote}
              onChange={(e) => set('complianceNote', e.target.value)}
              rows={2}
            />
          )}

          {cond(
            'euDataResidency',
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.euDataResidency}
                onChange={(e) => set('euDataResidency', e.target.checked)}
              />
              {fields.euDataResidency.label}
            </label>
          )}

          {cond(
            'customerHealthImpact',
            <Input
              label={fields.customerHealthImpact.label}
              value={formData.customerHealthImpact}
              onChange={(e) => set('customerHealthImpact', e.target.value)}
              placeholder="e.g. 3 ARR at risk"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Account"
              value={formData.account_id}
              onChange={(e) => set('account_id', e.target.value)}
              options={[
                { value: '', label: 'Select an account' },
                ...accounts.map((a) => ({ value: a.id, label: a.name })),
              ]}
            />
            <Select
              label="Contact"
              value={formData.contact_id}
              onChange={(e) => set('contact_id', e.target.value)}
              options={[
                { value: '', label: 'Select a contact' },
                ...contacts.map((c) => ({
                  value: c.id,
                  label: `${c.firstName} ${c.lastName}`,
                })),
              ]}
            />
          </div>

          <Input
            label="Owner"
            value={formData.owner}
            onChange={(e) => set('owner', e.target.value)}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Case'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
