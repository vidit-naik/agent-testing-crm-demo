'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { SearchableCombobox } from '../ui/SearchableCombobox'
import { PortalSelect } from '../ui/PortalSelect'
import { Toast, ToastContainer } from '../ui/Toast'
import {
  Check,
  ChevronRight,
  FileText,
  Trash2,
  Upload,
  Users,
  AlertTriangle,
  Clock,
  DollarSign,
  Shield,
  Plus,
  X,
  Save,
  RotateCcw,
  Send,
  Eye,
  XOctagon,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────
type DealType = 'new_business' | 'renewal' | 'expansion' | 'partnership'
type ApprovalStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'executed'
type StakeholderRole = 'decision_maker' | 'influencer' | 'approver' | 'legal' | 'finance' | 'technical'

interface Stakeholder {
  id: string
  name: string
  email: string
  role: StakeholderRole
  approved: boolean
  addedAt: number
}

interface LineItem {
  id: string
  product: string
  quantity: number
  unitPrice: number
  discount: number
}

interface DealDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: number
  status: 'uploading' | 'uploaded' | 'failed'
}

interface DealNote {
  id: string
  author: string
  content: string
  createdAt: number
}

interface ApprovalEvent {
  id: string
  action: string
  actor: string
  timestamp: number
  note?: string
}

interface DealState {
  name: string
  type: DealType
  priority: 'low' | 'medium' | 'high' | 'critical'
  closeDate: string
  description: string
  customField1: string
  customField2: string
  customField3: string
  stakeholders: Stakeholder[]
  lineItems: LineItem[]
  documents: DealDocument[]
  notes: DealNote[]
  approvalStatus: ApprovalStatus
  approvalHistory: ApprovalEvent[]
  selectedStakeholderIds: string[]
}

type DealAction =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'SET_TYPE'; dealType: DealType }
  | { type: 'ADD_STAKEHOLDER'; stakeholder: Stakeholder }
  | { type: 'REMOVE_STAKEHOLDER'; id: string }
  | { type: 'UPDATE_STAKEHOLDER_ROLE'; id: string; role: StakeholderRole }
  | { type: 'TOGGLE_STAKEHOLDER_APPROVAL'; id: string }
  | { type: 'ADD_LINE_ITEM'; item: LineItem }
  | { type: 'UPDATE_LINE_ITEM'; id: string; field: string; value: any }
  | { type: 'REMOVE_LINE_ITEM'; id: string }
  | { type: 'ADD_DOCUMENT'; doc: DealDocument }
  | { type: 'UPDATE_DOCUMENT_STATUS'; id: string; status: DealDocument['status'] }
  | { type: 'REMOVE_DOCUMENT'; id: string }
  | { type: 'ADD_NOTE'; note: DealNote }
  | { type: 'SUBMIT_FOR_REVIEW' }
  | { type: 'START_REVIEW' }
  | { type: 'APPROVE' }
  | { type: 'REJECT'; reason: string }
  | { type: 'EXECUTE' }
  | { type: 'RESET_TO_DRAFT' }

const INITIAL_STATE: DealState = {
  name: '',
  type: 'new_business',
  priority: 'medium',
  closeDate: '',
  description: '',
  customField1: '',
  customField2: '',
  customField3: '',
  stakeholders: [],
  lineItems: [
    { id: 'li-1', product: 'enterprise', quantity: 1, unitPrice: 50000, discount: 0 },
  ],
  documents: [],
  notes: [],
  approvalStatus: 'draft',
  approvalHistory: [],
  selectedStakeholderIds: [],
}

// BUG: Deal value calculation uses a stale closure — rapid successive edits
// to line items cause the total to lag behind by one update cycle
let _cachedTotal = 0
let _totalComputeTimer: ReturnType<typeof setTimeout> | null = null

function computeDealValue(items: LineItem[]): number {
  if (_totalComputeTimer) clearTimeout(_totalComputeTimer)
  const prev = _cachedTotal
  _totalComputeTimer = setTimeout(() => {
    _cachedTotal = items.reduce((sum, li) => {
      const subtotal = li.quantity * li.unitPrice
      // BUG: Discount applied incorrectly — subtracts discount as dollar amount
      // when UI labels it as percentage. 10% discount on $50k shows as $49,990
      // instead of $45,000
      return sum + (subtotal - li.discount)
    }, 0)
  }, 50)
  return prev
}

function dealReducer(state: DealState, action: DealAction): DealState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_TYPE':
      return { ...state, type: action.dealType, customField1: '', customField2: '', customField3: '' }
    case 'ADD_STAKEHOLDER':
      return { ...state, stakeholders: [...state.stakeholders, action.stakeholder] }
    case 'REMOVE_STAKEHOLDER':
      // BUG: Removing a stakeholder does NOT remove their approval vote
      // from the history or reset their approved flag consideration.
      // If they previously approved and then get removed, the deal
      // can still be executed with a phantom approval.
      return {
        ...state,
        stakeholders: state.stakeholders.filter((s) => s.id !== action.id),
      }
    case 'UPDATE_STAKEHOLDER_ROLE':
      return {
        ...state,
        stakeholders: state.stakeholders.map((s) =>
          s.id === action.id ? { ...s, role: action.role } : s
        ),
      }
    case 'TOGGLE_STAKEHOLDER_APPROVAL':
      return {
        ...state,
        stakeholders: state.stakeholders.map((s) =>
          s.id === action.id ? { ...s, approved: !s.approved } : s
        ),
      }
    case 'ADD_LINE_ITEM':
      return { ...state, lineItems: [...state.lineItems, action.item] }
    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map((li) =>
          li.id === action.id ? { ...li, [action.field]: action.value } : li
        ),
      }
    case 'REMOVE_LINE_ITEM':
      return { ...state, lineItems: state.lineItems.filter((li) => li.id !== action.id) }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.doc] }
    case 'UPDATE_DOCUMENT_STATUS':
      return {
        ...state,
        documents: state.documents.map((d) =>
          d.id === action.id ? { ...d, status: action.status } : d
        ),
      }
    case 'REMOVE_DOCUMENT':
      return { ...state, documents: state.documents.filter((d) => d.id !== action.id) }
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] }
    case 'SUBMIT_FOR_REVIEW':
      return {
        ...state,
        approvalStatus: 'pending_review',
        approvalHistory: [
          ...state.approvalHistory,
          {
            id: `ev-${Date.now()}`,
            action: 'Submitted for review',
            actor: 'Current User',
            timestamp: Date.now(),
          },
        ],
      }
    case 'START_REVIEW':
      return {
        ...state,
        approvalStatus: 'in_review',
        approvalHistory: [
          ...state.approvalHistory,
          {
            id: `ev-${Date.now()}`,
            action: 'Review started',
            actor: 'Current User',
            timestamp: Date.now(),
          },
        ],
      }
    case 'APPROVE':
      return {
        ...state,
        approvalStatus: 'approved',
        approvalHistory: [
          ...state.approvalHistory,
          {
            id: `ev-${Date.now()}`,
            action: 'Approved',
            actor: 'Current User',
            timestamp: Date.now(),
          },
        ],
      }
    case 'REJECT':
      return {
        ...state,
        approvalStatus: 'rejected',
        approvalHistory: [
          ...state.approvalHistory,
          {
            id: `ev-${Date.now()}`,
            action: 'Rejected',
            actor: 'Current User',
            timestamp: Date.now(),
            note: action.reason,
          },
        ],
      }
    case 'EXECUTE':
      return {
        ...state,
        approvalStatus: 'executed',
        approvalHistory: [
          ...state.approvalHistory,
          {
            id: `ev-${Date.now()}`,
            action: 'Deal executed',
            actor: 'Current User',
            timestamp: Date.now(),
          },
        ],
      }
    case 'RESET_TO_DRAFT':
      return {
        ...state,
        approvalStatus: 'draft',
        approvalHistory: [
          ...state.approvalHistory,
          {
            id: `ev-${Date.now()}`,
            action: 'Reset to draft',
            actor: 'Current User',
            timestamp: Date.now(),
          },
        ],
      }
    default:
      return state
  }
}

// ── Fake contact data ──────────────────────────────────────────────────
const CONTACTS = [
  { value: 'c1', label: 'Sarah Chen', email: 'sarah.chen@acme.com' },
  { value: 'c2', label: 'Marcus Johnson', email: 'mjohnson@globex.io' },
  { value: 'c3', label: 'Priya Sharma', email: 'priya@initech.co' },
  { value: 'c4', label: 'James O\'Brien', email: 'jobrien@wayne.ent' },
  { value: 'c5', label: 'Aisha Williams', email: 'aisha.w@stark.ind' },
  { value: 'c6', label: 'David Kim', email: 'dkim@oscorp.com' },
  { value: 'c7', label: 'Elena Rodriguez', email: 'elena.r@lexcorp.com' },
  { value: 'c8', label: 'Robert Singh', email: 'rsingh@umbrella.co' },
  { value: 'c9', label: 'Maria Gonzalez', email: 'mgonzalez@cyberdyne.ai' },
  { value: 'c10', label: 'Thomas Lee', email: 'tlee@weyland.corp' },
]

const PRODUCTS = [
  { value: 'enterprise', label: 'Enterprise License', price: 50000 },
  { value: 'professional', label: 'Professional License', price: 25000 },
  { value: 'starter', label: 'Starter License', price: 10000 },
  { value: 'addon_analytics', label: 'Analytics Add-on', price: 15000 },
  { value: 'addon_security', label: 'Security Add-on', price: 20000 },
  { value: 'addon_support', label: 'Premium Support', price: 12000 },
  { value: 'consulting', label: 'Implementation Consulting', price: 8000 },
  { value: 'training', label: 'Training Package', price: 5000 },
]

// ── Tabs ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'stakeholders', label: 'Parties', icon: Users },
  { id: 'terms', label: 'Terms', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: Upload },
  { id: 'approval', label: 'Approval', icon: Shield },
] as const

type TabId = (typeof TABS)[number]['id']

// ── Main Component ─────────────────────────────────────────────────────
export default function DealRoomLab() {
  const [state, dispatch] = useReducer(dealReducer, INITIAL_STATE)
  const [activeTab, setActiveTab] = useState<TabId>('details')
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([])
  const [saving, setSaving] = useState(false)
  const [unsavedNote, setUnsavedNote] = useState('')
  const noteRef = useRef<HTMLTextAreaElement>(null)

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToasts((prev) => [...prev, { id: `t-${Date.now()}-${Math.random()}`, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // BUG: Auto-save fires but doesn't actually persist note content that's
  // in the textarea when switching tabs. The unsavedNote state gets reset
  // by the tab switch before the "save" fires.
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    if (tab !== 'documents') {
      setUnsavedNote('')
    }
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    addToast('Deal saved successfully', 'success')
  }, [addToast])

  const dealValue = useMemo(() => computeDealValue(state.lineItems), [state.lineItems])

  const validationErrors = useMemo(() => {
    const errors: Record<string, string[]> = { details: [], stakeholders: [], terms: [], documents: [], approval: [] }
    if (!state.name.trim()) errors.details.push('Deal name is required')
    if (!state.closeDate) errors.details.push('Close date is required')
    if (state.type === 'renewal' && !state.customField1) errors.details.push('Renewal term is required')
    if (state.type === 'partnership' && !state.customField2) errors.details.push('Partner territory is required')
    if (state.stakeholders.length === 0) errors.stakeholders.push('At least one stakeholder is required')
    // BUG: Checks for approver role in current stakeholders list, but doesn't check
    // if a removed stakeholder's phantom approval is still counting
    if (!state.stakeholders.some((s) => s.role === 'approver'))
      errors.stakeholders.push('At least one approver is required')
    if (state.lineItems.length === 0) errors.terms.push('At least one line item is required')
    if (state.approvalStatus !== 'draft' && state.documents.length === 0)
      errors.documents.push('Documents are required before review')
    return errors
  }, [state])

  const totalErrors = Object.values(validationErrors).flat().length

  const contactFetcher = useCallback(async (q: string) => {
    return CONTACTS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))
  }, [])

  // ── Tab: Details ─────────────────────────────────────────────────────
  function DetailsTab() {
    return (
      <div className="space-y-6" data-testid="deal-details-tab">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="deal-name" className="block text-sm font-medium mb-1">Deal name *</label>
            <input
              id="deal-name"
              data-testid="deal-name-input"
              value={state.name}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Acme Corp Enterprise Deal"
            />
          </div>
          <div>
            <label htmlFor="deal-type" className="block text-sm font-medium mb-1">Deal type</label>
            <PortalSelect
              id="deal-type"
              value={state.type}
              onChange={(v) => dispatch({ type: 'SET_TYPE', dealType: v as DealType })}
              options={[
                { value: 'new_business', label: 'New Business' },
                { value: 'renewal', label: 'Renewal' },
                { value: 'expansion', label: 'Expansion' },
                { value: 'partnership', label: 'Partnership' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="deal-priority" className="block text-sm font-medium mb-1">Priority</label>
            <PortalSelect
              id="deal-priority"
              value={state.priority}
              onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'priority', value: v })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </div>
          <div>
            <label htmlFor="deal-close-date" className="block text-sm font-medium mb-1">Expected close date *</label>
            <input
              id="deal-close-date"
              type="date"
              data-testid="deal-close-date"
              value={state.closeDate}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'closeDate', value: e.target.value })}
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="deal-description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="deal-description"
            data-testid="deal-description"
            value={state.description}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Describe the deal context and objectives..."
          />
        </div>

        {/* Conditional fields based on deal type */}
        {state.type === 'renewal' && (
          <div className="border-t pt-4 space-y-4" data-testid="renewal-fields">
            <h3 className="text-sm font-semibold text-muted-foreground">Renewal details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="renewal-term" className="block text-sm font-medium mb-1">Renewal term *</label>
                <PortalSelect
                  id="renewal-term"
                  value={state.customField1}
                  onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'customField1', value: v })}
                  options={[
                    { value: '12', label: '12 months' },
                    { value: '24', label: '24 months' },
                    { value: '36', label: '36 months' },
                  ]}
                  placeholder="Select term"
                />
              </div>
              <div>
                <label htmlFor="renewal-uplift" className="block text-sm font-medium mb-1">Price uplift %</label>
                <input
                  id="renewal-uplift"
                  type="number"
                  data-testid="renewal-uplift"
                  value={state.customField2}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'customField2', value: e.target.value })}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        {state.type === 'expansion' && (
          <div className="border-t pt-4 space-y-4" data-testid="expansion-fields">
            <h3 className="text-sm font-semibold text-muted-foreground">Expansion details</h3>
            <div>
              <label htmlFor="expansion-seats" className="block text-sm font-medium mb-1">Additional seats</label>
              <input
                id="expansion-seats"
                type="number"
                data-testid="expansion-seats"
                value={state.customField1}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'customField1', value: e.target.value })}
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>
        )}

        {state.type === 'partnership' && (
          <div className="border-t pt-4 space-y-4" data-testid="partnership-fields">
            <h3 className="text-sm font-semibold text-muted-foreground">Partnership details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="partner-territory" className="block text-sm font-medium mb-1">Territory *</label>
                <PortalSelect
                  id="partner-territory"
                  value={state.customField2}
                  onChange={(v) => dispatch({ type: 'SET_FIELD', field: 'customField2', value: v })}
                  options={[
                    { value: 'north_america', label: 'North America' },
                    { value: 'europe', label: 'Europe' },
                    { value: 'apac', label: 'Asia-Pacific' },
                    { value: 'latam', label: 'Latin America' },
                  ]}
                  placeholder="Select territory"
                />
              </div>
              <div>
                <label htmlFor="partner-commission" className="block text-sm font-medium mb-1">Commission %</label>
                <input
                  id="partner-commission"
                  type="number"
                  data-testid="partner-commission"
                  value={state.customField3}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'customField3', value: e.target.value })}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Tab: Stakeholders ────────────────────────────────────────────────
  function StakeholdersTab() {
    const [selectedContact, setSelectedContact] = useState<{ value: string; label: string } | null>(null)
    const [selectedRole, setSelectedRole] = useState<StakeholderRole>('influencer')

    const addStakeholder = () => {
      if (!selectedContact) return
      const contact = CONTACTS.find((c) => c.value === selectedContact.value)
      if (!contact) return
      if (state.stakeholders.some((s) => s.email === contact.email)) {
        addToast('This contact is already a stakeholder', 'error')
        return
      }
      dispatch({
        type: 'ADD_STAKEHOLDER',
        stakeholder: {
          id: `sh-${Date.now()}`,
          name: contact.label,
          email: contact.email,
          role: selectedRole,
          approved: false,
          addedAt: Date.now(),
        },
      })
      setSelectedContact(null)
      addToast(`${contact.label} added as ${selectedRole.replace('_', ' ')}`, 'success')
    }

    return (
      <div className="space-y-6" data-testid="deal-stakeholders-tab">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <SearchableCombobox
              placeholder="Search contacts..."
              value={selectedContact}
              label="Add stakeholder"
              fetcher={contactFetcher}
              onChange={(opt) => setSelectedContact(opt)}
              debounceMs={300}
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium mb-1">Role</label>
            <PortalSelect
              value={selectedRole}
              onChange={(v) => setSelectedRole(v as StakeholderRole)}
              options={[
                { value: 'decision_maker', label: 'Decision Maker' },
                { value: 'influencer', label: 'Influencer' },
                { value: 'approver', label: 'Approver' },
                { value: 'legal', label: 'Legal' },
                { value: 'finance', label: 'Finance' },
                { value: 'technical', label: 'Technical' },
              ]}
            />
          </div>
          <button
            onClick={addStakeholder}
            disabled={!selectedContact}
            data-testid="add-stakeholder-btn"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {state.stakeholders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground" data-testid="no-stakeholders">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No stakeholders added yet</p>
            <p className="text-xs mt-1">Search and add contacts to this deal</p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y" data-testid="stakeholders-list">
            {state.stakeholders.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-4 py-3" data-testid={`stakeholder-${s.id}`}>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {s.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </div>
                <div className="w-40">
                  <PortalSelect
                    value={s.role}
                    onChange={(v) => dispatch({ type: 'UPDATE_STAKEHOLDER_ROLE', id: s.id, role: v as StakeholderRole })}
                    options={[
                      { value: 'decision_maker', label: 'Decision Maker' },
                      { value: 'influencer', label: 'Influencer' },
                      { value: 'approver', label: 'Approver' },
                      { value: 'legal', label: 'Legal' },
                      { value: 'finance', label: 'Finance' },
                      { value: 'technical', label: 'Technical' },
                    ]}
                  />
                </div>
                {state.approvalStatus !== 'draft' && s.role === 'approver' && (
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_STAKEHOLDER_APPROVAL', id: s.id })}
                    data-testid={`approve-toggle-${s.id}`}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      s.approved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {s.approved ? 'Approved' : 'Pending'}
                  </button>
                )}
                <button
                  onClick={() => dispatch({ type: 'REMOVE_STAKEHOLDER', id: s.id })}
                  data-testid={`remove-stakeholder-${s.id}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4" data-testid="stakeholder-summary">
          <h4 className="text-sm font-semibold mb-2">Stakeholder summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total</div>
              <div className="font-medium" data-testid="stakeholder-count">{state.stakeholders.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Approvers</div>
              <div className="font-medium" data-testid="approver-count">
                {state.stakeholders.filter((s) => s.role === 'approver').length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Approved</div>
              <div className="font-medium" data-testid="approved-count">
                {state.stakeholders.filter((s) => s.role === 'approver' && s.approved).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Tab: Terms (Line Items) ──────────────────────────────────────────
  function TermsTab() {
    const addLineItem = () => {
      dispatch({
        type: 'ADD_LINE_ITEM',
        item: {
          id: `li-${Date.now()}`,
          product: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
        },
      })
    }

    return (
      <div className="space-y-6" data-testid="deal-terms-tab">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Line items</h3>
          <button
            onClick={addLineItem}
            data-testid="add-line-item-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full" data-testid="line-items-table">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-right px-4 py-2 font-medium w-24">Qty</th>
                <th className="text-right px-4 py-2 font-medium w-32">Unit price</th>
                <th className="text-right px-4 py-2 font-medium w-28">Discount %</th>
                <th className="text-right px-4 py-2 font-medium w-32">Subtotal</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {state.lineItems.map((li) => {
                const subtotal = li.quantity * li.unitPrice
                // BUG: Display shows correct percentage math, but the stored
                // value and deal total use dollar subtraction
                const discountedTotal = subtotal * (1 - li.discount / 100)
                return (
                  <tr key={li.id} data-testid={`line-item-${li.id}`}>
                    <td className="px-4 py-2">
                      <PortalSelect
                        value={li.product}
                        onChange={(v, label) => {
                          const prod = PRODUCTS.find((p) => p.value === v)
                          dispatch({ type: 'UPDATE_LINE_ITEM', id: li.id, field: 'product', value: v })
                          if (prod) {
                            dispatch({ type: 'UPDATE_LINE_ITEM', id: li.id, field: 'unitPrice', value: prod.price })
                          }
                        }}
                        options={PRODUCTS.map((p) => ({ value: p.value, label: p.label }))}
                        placeholder="Select product"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={li.quantity}
                        data-testid={`qty-${li.id}`}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_LINE_ITEM',
                            id: li.id,
                            field: 'quantity',
                            // BUG: parseInt with no radix — '08' and '09' parse
                            // incorrectly in some environments, and empty string
                            // becomes NaN silently
                            value: parseInt(e.target.value),
                          })
                        }
                        className="w-full text-right rounded-md border border-input px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          value={li.unitPrice}
                          data-testid={`price-${li.id}`}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_LINE_ITEM',
                              id: li.id,
                              field: 'unitPrice',
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full text-right rounded-md border border-input pl-6 pr-2 py-1.5 text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={li.discount}
                          data-testid={`discount-${li.id}`}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_LINE_ITEM',
                              id: li.id,
                              field: 'discount',
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full text-right rounded-md border border-input px-2 py-1.5 text-sm"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium" data-testid={`subtotal-${li.id}`}>
                      ${discountedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_LINE_ITEM', id: li.id })}
                        data-testid={`remove-line-item-${li.id}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-72 space-y-2 text-sm" data-testid="deal-totals">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>
                ${state.lineItems
                  .reduce((sum, li) => sum + li.quantity * li.unitPrice, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">After discounts</span>
              <span>
                ${state.lineItems
                  .reduce((sum, li) => {
                    const sub = li.quantity * li.unitPrice
                    return sum + sub * (1 - li.discount / 100)
                  }, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Deal value</span>
              {/* BUG: This shows the CACHED deal value from computeDealValue,
                  which lags by one update due to the setTimeout */}
              <span data-testid="deal-total-value">
                ${dealValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Tab: Documents ───────────────────────────────────────────────────
  function DocumentsTab() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)

    const handleFiles = (files: FileList | null) => {
      if (!files) return
      Array.from(files).forEach((file) => {
        const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`
        dispatch({
          type: 'ADD_DOCUMENT',
          doc: {
            id: docId,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            uploadedAt: Date.now(),
            status: 'uploading',
          },
        })
        // BUG: If user switches tabs while upload is in progress,
        // the timeout still fires but the "uploaded" status shows even though
        // the simulated upload was conceptually "cancelled" by tab switch.
        // The UI shows "uploaded" but the file wasn't actually processed.
        setTimeout(() => {
          dispatch({ type: 'UPDATE_DOCUMENT_STATUS', id: docId, status: 'uploaded' })
          addToast(`${file.name} uploaded`, 'success')
        }, 1500 + Math.random() * 2000)
      })
    }

    return (
      <div className="space-y-6" data-testid="deal-documents-tab">
        <div
          data-testid="document-dropzone"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or images up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            data-testid="document-file-input"
          />
        </div>

        {state.documents.length > 0 && (
          <div className="border rounded-lg divide-y" data-testid="documents-list">
            {state.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-4 py-3" data-testid={`document-${doc.id}`}>
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{doc.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(doc.size / 1024).toFixed(1)} KB · {new Date(doc.uploadedAt).toLocaleTimeString()}
                  </div>
                </div>
                <div data-testid={`doc-status-${doc.id}`}>
                  {doc.status === 'uploading' && (
                    <span className="text-xs text-yellow-600 font-medium animate-pulse">Uploading...</span>
                  )}
                  {doc.status === 'uploaded' && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <Check className="h-3.5 w-3.5" /> Uploaded
                    </span>
                  )}
                  {doc.status === 'failed' && (
                    <span className="text-xs text-red-600 font-medium">Failed</span>
                  )}
                </div>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_DOCUMENT', id: doc.id })}
                  data-testid={`remove-doc-${doc.id}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notes section within documents tab */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-semibold mb-3">Deal notes</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <textarea
                ref={noteRef}
                value={unsavedNote}
                onChange={(e) => setUnsavedNote(e.target.value)}
                placeholder="Add a note about this deal..."
                data-testid="deal-note-input"
                rows={2}
                className="flex-1 rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <button
                onClick={() => {
                  if (!unsavedNote.trim()) return
                  dispatch({
                    type: 'ADD_NOTE',
                    note: {
                      id: `note-${Date.now()}`,
                      author: 'Current User',
                      content: unsavedNote,
                      createdAt: Date.now(),
                    },
                  })
                  setUnsavedNote('')
                  addToast('Note added', 'success')
                }}
                disabled={!unsavedNote.trim()}
                data-testid="add-note-btn"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium self-end disabled:opacity-50 hover:bg-primary/90"
              >
                Add
              </button>
            </div>

            {state.notes.length > 0 && (
              <div className="space-y-2" data-testid="notes-list">
                {state.notes.map((note) => (
                  <div key={note.id} className="bg-muted/50 rounded-lg p-3" data-testid={`note-${note.id}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{note.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Tab: Approval ────────────────────────────────────────────────────
  function ApprovalTab() {
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectDialog, setShowRejectDialog] = useState(false)

    const approvers = state.stakeholders.filter((s) => s.role === 'approver')
    const allApproved = approvers.length > 0 && approvers.every((a) => a.approved)

    const canSubmit = state.name.trim() && state.closeDate && state.stakeholders.length > 0 && state.lineItems.length > 0
    const canExecute = allApproved && state.approvalStatus === 'approved'

    const statusColors: Record<ApprovalStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending_review: 'bg-yellow-100 text-yellow-700',
      in_review: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      executed: 'bg-purple-100 text-purple-700',
    }

    const statusLabels: Record<ApprovalStatus, string> = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      in_review: 'In Review',
      approved: 'Approved',
      rejected: 'Rejected',
      executed: 'Executed',
    }

    return (
      <div className="space-y-6" data-testid="deal-approval-tab">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Approval workflow</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Manage deal review and execution</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[state.approvalStatus]}`}
            data-testid="approval-status-badge"
          >
            {statusLabels[state.approvalStatus]}
          </span>
        </div>

        {/* State machine visualization */}
        <div className="flex items-center gap-2 overflow-x-auto py-2" data-testid="approval-pipeline">
          {(['draft', 'pending_review', 'in_review', 'approved', 'executed'] as ApprovalStatus[]).map((status, i, arr) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  status === state.approvalStatus
                    ? 'bg-primary text-primary-foreground'
                    : arr.indexOf(state.approvalStatus) > i ||
                      (state.approvalStatus === 'rejected' && i < 3)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
                }`}
                data-testid={`stage-${status}`}
              >
                {statusLabels[status]}
              </div>
              {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Actions based on current status */}
        <div className="border rounded-lg p-4 space-y-4" data-testid="approval-actions">
          {state.approvalStatus === 'draft' && (
            <>
              {totalErrors > 0 && (
                <div className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 rounded-md p-3" data-testid="validation-warnings">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Resolve before submitting:</p>
                    <ul className="list-disc list-inside mt-1 text-xs space-y-0.5">
                      {Object.entries(validationErrors)
                        .flatMap(([, errs]) => errs)
                        .map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
              <button
                onClick={() => dispatch({ type: 'SUBMIT_FOR_REVIEW' })}
                disabled={!canSubmit}
                data-testid="submit-for-review-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90"
              >
                <Send className="h-4 w-4" /> Submit for review
              </button>
            </>
          )}

          {state.approvalStatus === 'pending_review' && (
            <button
              onClick={() => dispatch({ type: 'START_REVIEW' })}
              data-testid="start-review-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              <Eye className="h-4 w-4" /> Start review
            </button>
          )}

          {state.approvalStatus === 'in_review' && (
            <div className="space-y-4">
              <div data-testid="approver-checklist">
                <h4 className="text-sm font-medium mb-2">Approver checklist</h4>
                {approvers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approvers assigned</p>
                ) : (
                  <div className="space-y-2">
                    {approvers.map((a) => (
                      <div key={a.id} className="flex items-center gap-3" data-testid={`approver-check-${a.id}`}>
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center ${
                            a.approved ? 'bg-green-500 text-white' : 'border-2 border-muted-foreground/30'
                          }`}
                        >
                          {a.approved && <Check className="h-3 w-3" />}
                        </div>
                        <span className="text-sm">{a.name}</span>
                        <span className="text-xs text-muted-foreground">({a.role.replace('_', ' ')})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => dispatch({ type: 'APPROVE' })}
                  disabled={!allApproved}
                  data-testid="approve-deal-btn"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-green-700"
                >
                  <Check className="h-4 w-4" /> Approve deal
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  data-testid="reject-deal-btn"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                >
                  <XOctagon className="h-4 w-4" /> Reject
                </button>
              </div>

              {showRejectDialog && (
                <div className="border rounded-md p-4 bg-red-50" data-testid="reject-dialog">
                  <label className="block text-sm font-medium mb-1">Rejection reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    data-testid="reject-reason-input"
                    rows={2}
                    className="w-full rounded-md border px-3 py-2 text-sm mb-2"
                    placeholder="Explain why this deal is being rejected..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        dispatch({ type: 'REJECT', reason: rejectReason })
                        setShowRejectDialog(false)
                        setRejectReason('')
                        addToast('Deal rejected', 'error')
                      }}
                      disabled={!rejectReason.trim()}
                      data-testid="confirm-reject-btn"
                      className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium disabled:opacity-50"
                    >
                      Confirm rejection
                    </button>
                    <button
                      onClick={() => { setShowRejectDialog(false); setRejectReason('') }}
                      className="px-3 py-1.5 rounded-md border text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {state.approvalStatus === 'approved' && (
            <button
              onClick={() => {
                dispatch({ type: 'EXECUTE' })
                addToast('Deal executed successfully!', 'success')
              }}
              data-testid="execute-deal-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
            >
              <Shield className="h-4 w-4" /> Execute deal
            </button>
          )}

          {state.approvalStatus === 'rejected' && (
            <div className="space-y-3">
              <div className="bg-red-50 rounded-md p-3">
                <p className="text-sm text-red-700">
                  <strong>Rejected:</strong>{' '}
                  {state.approvalHistory.filter((e) => e.action === 'Rejected').pop()?.note || 'No reason provided'}
                </p>
              </div>
              <button
                onClick={() => dispatch({ type: 'RESET_TO_DRAFT' })}
                data-testid="reset-to-draft-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" /> Reset to draft
              </button>
            </div>
          )}

          {state.approvalStatus === 'executed' && (
            <div className="text-center py-4" data-testid="executed-state">
              <Shield className="h-12 w-12 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Deal has been executed</p>
              <p className="text-xs text-muted-foreground mt-1">
                ${dealValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Closed{' '}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Approval history */}
        {state.approvalHistory.length > 0 && (
          <div data-testid="approval-history">
            <h4 className="text-sm font-semibold mb-3">History</h4>
            <div className="space-y-3">
              {state.approvalHistory.map((event) => (
                <div key={event.id} className="flex items-start gap-3" data-testid={`history-${event.id}`}>
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">{event.action}</span>
                      <span className="text-muted-foreground"> by {event.actor}</span>
                    </div>
                    {event.note && <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Main Layout ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6" data-testid="deal-room">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal room</h1>
          <p className="text-sm text-muted-foreground">
            Manage deal lifecycle from proposal to execution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              state.approvalStatus === 'draft'
                ? 'bg-gray-100 text-gray-700'
                : state.approvalStatus === 'executed'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}
            data-testid="header-status"
          >
            {state.approvalStatus.replace('_', ' ')}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            data-testid="save-deal-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" role="tablist" data-testid="deal-tabs">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const errors = validationErrors[tab.id] || []
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {errors.length > 0 && (
                  <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {errors.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div role="tabpanel" data-testid="tab-panel">
        {activeTab === 'details' && <DetailsTab />}
        {activeTab === 'stakeholders' && <StakeholdersTab />}
        {activeTab === 'terms' && <TermsTab />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'approval' && <ApprovalTab />}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
