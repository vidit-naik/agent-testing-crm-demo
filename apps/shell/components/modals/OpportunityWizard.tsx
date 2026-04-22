'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMachine } from '@xstate/react'
import { assign, setup } from 'xstate'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'

type Ctx = {
  name: string
  accountId: string
  accountLabel: string
  stage: string
  ownerName: string
  ownerEmail: string
  value: string
  probability: string
  closeDate: string
  discount: string
  nextSteps: string
  applyDiscount: boolean
}

const TAB_ORDER = ['details', 'stakeholders', 'pricing', 'review'] as const
type Tab = (typeof TAB_ORDER)[number]

const TAB_LABELS: Record<Tab, string> = {
  details: 'Details',
  stakeholders: 'Stakeholders',
  pricing: 'Pricing',
  review: 'Review',
}

const STAGES = [
  'Prospecting',
  'Qualification',
  'Discovery',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
]

const initialCtx: Ctx = {
  name: '',
  accountId: '',
  accountLabel: '',
  stage: 'Prospecting',
  ownerName: '',
  ownerEmail: '',
  value: '',
  probability: '20',
  closeDate: '',
  discount: '',
  nextSteps: '',
  applyDiscount: false,
}

const wizardMachine = setup({
  types: {
    context: {} as Ctx,
    events: {} as
      | { type: 'NEXT' }
      | { type: 'BACK' }
      | { type: 'SET'; patch: Partial<Ctx> }
      | { type: 'SUBMIT' }
      | { type: 'SUBMIT_DONE' }
      | { type: 'SUBMIT_FAIL' },
  },
  guards: {
    detailsValid: ({ context }) => context.name.trim().length >= 3 && !!context.accountId,
    stakeholdersValid: ({ context }) =>
      context.ownerName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(context.ownerEmail),
    pricingValid: ({ context }) => {
      const v = Number(context.value)
      const p = Number(context.probability)
      if (!Number.isFinite(v) || v <= 0) return false
      if (!Number.isFinite(p) || p < 0 || p > 100) return false
      if (!context.closeDate) return false
      if (context.applyDiscount) {
        const d = Number(context.discount)
        if (!Number.isFinite(d) || d < 0 || d > 100) return false
      }
      return true
    },
  },
  actions: {
    merge: assign(({ context, event }) => {
      if (event.type !== 'SET') return context
      return { ...context, ...event.patch }
    }),
  },
}).createMachine({
  id: 'opportunityWizard',
  context: initialCtx,
  initial: 'details',
  states: {
    details: {
      on: {
        SET: { actions: 'merge' },
        NEXT: { target: 'transitioning.toStakeholders', guard: 'detailsValid' },
      },
    },
    stakeholders: {
      on: {
        SET: { actions: 'merge' },
        BACK: 'transitioning.toDetails',
        NEXT: { target: 'transitioning.toPricing', guard: 'stakeholdersValid' },
      },
    },
    pricing: {
      on: {
        SET: { actions: 'merge' },
        BACK: 'transitioning.toStakeholders',
        NEXT: { target: 'transitioning.toReview', guard: 'pricingValid' },
      },
    },
    review: {
      on: {
        BACK: 'transitioning.toPricing',
        SUBMIT: 'submitting',
      },
    },
    transitioning: {
      initial: 'toDetails',
      states: {
        toDetails: { after: { 200: { target: '#opportunityWizard.details' } } },
        toStakeholders: { after: { 200: { target: '#opportunityWizard.stakeholders' } } },
        toPricing: { after: { 200: { target: '#opportunityWizard.pricing' } } },
        toReview: { after: { 200: { target: '#opportunityWizard.review' } } },
      },
    },
    submitting: {
      on: {
        SUBMIT_DONE: 'done',
        SUBMIT_FAIL: 'review',
      },
    },
    done: { type: 'final' },
  },
})

function currentTab(stateValue: any): Tab | 'transitioning' | 'submitting' | 'done' {
  if (typeof stateValue === 'string') return stateValue as any
  return 'transitioning'
}

function PortalSelect({
  value,
  onChange,
  options,
  placeholder,
  id,
}: {
  value: string
  onChange: (v: string, label: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  id?: string
}) {
  const selected = options.find((o) => o.value === value)
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(v) => {
        const opt = options.find((o) => o.value === v)
        onChange(v, opt?.label || '')
      }}
    >
      <SelectPrimitive.Trigger
        id={id}
        className="w-full inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <SelectPrimitive.Value placeholder={placeholder || 'Select'}>
          {selected ? selected.label : placeholder}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-[2000] min-w-[--radix-select-trigger-width] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          <SelectPrimitive.Viewport className="p-1 max-h-64">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 pr-8 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export function OpportunityWizard() {
  const { closeModal, addToast, modalState, triggerRefresh } = useApp()
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
  const [state, send] = useMachine(wizardMachine)
  const [showReason, setShowReason] = useState(false)

  useEffect(() => {
    setShowReason(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('showReason') === '1')
  }, [])

  useEffect(() => {
    fetch('/api/accounts')
      .then((r) => r.json())
      .then((d) => setAccounts(d || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (modalState.data?.accountId) {
      send({ type: 'SET', patch: { accountId: modalState.data.accountId } })
    }
  }, [modalState.data, send])

  const tab = currentTab(state.value)
  const isTransitioning = tab === 'transitioning'
  const isSubmitting = tab === 'submitting'
  const activeTab: Tab =
    typeof state.value === 'object' && state.value && 'transitioning' in (state.value as any)
      ? (TAB_ORDER.find((t) =>
          (state.value as any).transitioning.toLowerCase().includes(t)
        ) as Tab) || 'details'
      : (tab as Tab)

  const ctx = state.context
  const setField = (patch: Partial<Ctx>) => send({ type: 'SET', patch })

  const canProceed = useMemo(() => {
    if (activeTab === 'details') return ctx.name.trim().length >= 3 && !!ctx.accountId
    if (activeTab === 'stakeholders')
      return ctx.ownerName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctx.ownerEmail)
    if (activeTab === 'pricing') {
      const v = Number(ctx.value)
      const p = Number(ctx.probability)
      if (!Number.isFinite(v) || v <= 0) return false
      if (!Number.isFinite(p) || p < 0 || p > 100) return false
      if (!ctx.closeDate) return false
      if (ctx.applyDiscount) {
        const d = Number(ctx.discount)
        if (!Number.isFinite(d) || d < 0 || d > 100) return false
      }
      return true
    }
    return true
  }, [activeTab, ctx])

  const disabledReason = useMemo(() => {
    if (activeTab === 'details') {
      if (ctx.name.trim().length < 3) return 'Name requires 3+ characters'
      if (!ctx.accountId) return 'Select an account'
    }
    if (activeTab === 'stakeholders') {
      if (!ctx.ownerName.trim()) return 'Owner name required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctx.ownerEmail)) return 'Owner email invalid'
    }
    if (activeTab === 'pricing') {
      const v = Number(ctx.value)
      if (!Number.isFinite(v) || v <= 0) return 'Value must be positive'
      const p = Number(ctx.probability)
      if (!Number.isFinite(p) || p < 0 || p > 100) return 'Probability 0-100'
      if (!ctx.closeDate) return 'Close date required'
      if (ctx.applyDiscount) {
        const d = Number(ctx.discount)
        if (!Number.isFinite(d) || d < 0 || d > 100) return 'Discount 0-100'
      }
    }
    return ''
  }, [activeTab, ctx])

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }))

  const submit = async () => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ctx.name,
          account_id: ctx.accountId,
          stage: ctx.stage,
          value: ctx.value ? parseFloat(ctx.value) : null,
          probability: parseInt(ctx.probability),
          close_date: ctx.closeDate || null,
          owner: ctx.ownerName,
          next_steps: ctx.nextSteps,
        }),
      })
      if (!res.ok) throw new Error('submit failed')
      addToast('Opportunity created', 'success')
      triggerRefresh()
      send({ type: 'SUBMIT_DONE' })
      closeModal()
    } catch {
      send({ type: 'SUBMIT_FAIL' })
      addToast('Failed to create opportunity', 'error')
    }
  }

  useEffect(() => {
    if (state.matches('submitting')) {
      void submit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value])

  const nextDisabledExtra =
    showReason && !canProceed
      ? { 'aria-describedby': 'wizard-next-reason' as const }
      : {}

  return (
    <Modal isOpen onClose={closeModal} title="New Opportunity" size="xl">
      <div className="-mt-2 mb-4 flex items-center gap-1">
        {TAB_ORDER.map((t, i) => {
          const reached = TAB_ORDER.indexOf(activeTab) >= i
          const current = activeTab === t
          return (
            <div key={t} className="flex items-center flex-1 last:flex-none">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  current
                    ? 'bg-primary text-primary-foreground'
                    : reached
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
                data-wizard-tab={t}
                data-active={current}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/30 text-xs">
                  {i + 1}
                </span>
                {TAB_LABELS[t]}
              </div>
              {i < TAB_ORDER.length - 1 && (
                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )
        })}
      </div>

      <div className="min-h-[360px]">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <Input
              label="Opportunity name"
              value={ctx.name}
              onChange={(e) => setField({ name: e.target.value })}
              placeholder="ACME Q3 expansion"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium">Account</label>
              <PortalSelect
                id="wizard-account"
                value={ctx.accountId}
                onChange={(v, label) => setField({ accountId: v, accountLabel: label })}
                options={accountOptions}
                placeholder="Select an account"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Stage</label>
              <PortalSelect
                id="wizard-stage"
                value={ctx.stage}
                onChange={(v) => setField({ stage: v })}
                options={STAGES.map((s) => ({ value: s, label: s }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'stakeholders' && (
          <div className="space-y-4">
            <Input
              label="Owner name"
              value={ctx.ownerName}
              onChange={(e) => setField({ ownerName: e.target.value })}
              placeholder="Jane Smith"
            />
            <Input
              label="Owner email"
              type="email"
              value={ctx.ownerEmail}
              onChange={(e) => setField({ ownerEmail: e.target.value })}
              placeholder="jane@acme.com"
            />
            <Textarea
              label="Notes"
              value={ctx.nextSteps}
              onChange={(e) => setField({ nextSteps: e.target.value })}
              rows={3}
            />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Value (USD)"
                type="number"
                min="0"
                value={ctx.value}
                onChange={(e) => setField({ value: e.target.value })}
              />
              <Input
                label="Probability (%)"
                type="number"
                min="0"
                max="100"
                value={ctx.probability}
                onChange={(e) => setField({ probability: e.target.value })}
              />
            </div>
            <Input
              label="Close date"
              type="date"
              value={ctx.closeDate}
              onChange={(e) => setField({ closeDate: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ctx.applyDiscount}
                onChange={(e) => setField({ applyDiscount: e.target.checked })}
              />
              Apply discount
            </label>
            {ctx.applyDiscount && (
              <Input
                label="Discount (%)"
                type="number"
                min="0"
                max="100"
                value={ctx.discount}
                onChange={(e) => setField({ discount: e.target.value })}
              />
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-3 text-sm">
            <ReviewRow k="Name" v={ctx.name} />
            <ReviewRow k="Account" v={ctx.accountLabel || ctx.accountId} />
            <ReviewRow k="Stage" v={ctx.stage} />
            <ReviewRow k="Owner" v={`${ctx.ownerName} <${ctx.ownerEmail}>`} />
            <ReviewRow k="Value" v={ctx.value ? `$${Number(ctx.value).toLocaleString()}` : ''} />
            <ReviewRow k="Probability" v={`${ctx.probability}%`} />
            <ReviewRow k="Close date" v={ctx.closeDate} />
            {ctx.applyDiscount && <ReviewRow k="Discount" v={`${ctx.discount}%`} />}
          </div>
        )}
      </div>

      <ModalFooter>
        <div className="flex-1">
          {showReason && disabledReason && (
            <p id="wizard-next-reason" className="text-xs text-muted-foreground">
              {disabledReason}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
          Cancel
        </Button>
        {activeTab !== 'details' && (
          <Button
            variant="outline"
            onClick={() => send({ type: 'BACK' })}
            disabled={isTransitioning || isSubmitting}
          >
            Back
          </Button>
        )}
        {activeTab !== 'review' ? (
          <Button
            onClick={() => send({ type: 'NEXT' })}
            disabled={!canProceed || isTransitioning || isSubmitting}
            {...nextDisabledExtra}
          >
            Next
          </Button>
        ) : (
          <Button onClick={() => send({ type: 'SUBMIT' })} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 border-b last:border-0 py-1.5">
      <span className="w-32 text-muted-foreground">{k}</span>
      <span className="font-medium">{v || '—'}</span>
    </div>
  )
}
