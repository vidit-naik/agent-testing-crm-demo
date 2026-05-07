'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  DollarSign,
  MessageSquare,
  Plus,
  TrendingUp,
  User,
  X,
  Check,
  Trash2,
  ArrowRight,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────
type StageId = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

interface Stage {
  id: StageId
  label: string
  color: string
  bgColor: string
  probability: number
  requiredFields: string[]
}

interface Activity {
  id: string
  type: 'note' | 'stage_change' | 'assignment' | 'field_update'
  message: string
  actor: string
  timestamp: number
}

interface DealCard {
  id: string
  title: string
  company: string
  value: number
  owner: string
  stage: StageId
  createdAt: number
  stageEnteredAt: number
  closeDate: string
  contactName: string
  contactEmail: string
  notes: string
  activities: Activity[]
  priority: 'low' | 'medium' | 'high'
  probability: number
  products: string[]
}

// ── Constants ──────────────────────────────────────────────────────────
const STAGES: Stage[] = [
  {
    id: 'lead',
    label: 'Lead',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    probability: 10,
    requiredFields: [],
  },
  {
    id: 'qualified',
    label: 'Qualified',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    probability: 25,
    requiredFields: ['contactName', 'contactEmail'],
  },
  {
    id: 'proposal',
    label: 'Proposal',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    probability: 50,
    requiredFields: ['contactName', 'contactEmail', 'value'],
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    probability: 75,
    requiredFields: ['contactName', 'contactEmail', 'value', 'closeDate'],
  },
  {
    id: 'closed_won',
    label: 'Closed Won',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    probability: 100,
    requiredFields: ['contactName', 'contactEmail', 'value', 'closeDate', 'products'],
  },
  {
    id: 'closed_lost',
    label: 'Closed Lost',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    probability: 0,
    requiredFields: ['notes'],
  },
]

const OWNERS = ['Sarah C.', 'Marcus J.', 'Priya S.', 'James O.', 'Aisha W.']
const PRODUCT_OPTIONS = ['Enterprise', 'Professional', 'Analytics', 'Security', 'Support', 'Training']

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateDeals(): DealCard[] {
  const rand = seededRandom(99)
  const deals: DealCard[] = []
  const companies = ['Acme', 'Globex', 'Initech', 'Wayne', 'Stark', 'Oscorp', 'LexCorp', 'Umbrella',
    'Cyberdyne', 'Weyland', 'Massive Dynamic', 'Soylent', 'Tyrell', 'Vought', 'Aperture']
  const stageIds: StageId[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

  for (let i = 0; i < 24; i++) {
    const stage = stageIds[Math.floor(rand() * 4)] // mostly open stages
    const company = companies[Math.floor(rand() * companies.length)]
    const daysAgo = Math.floor(rand() * 60) + 1
    const stageAgo = Math.floor(rand() * daysAgo)
    const value = Math.floor(rand() * 200000) + 10000

    deals.push({
      id: `deal-${i}`,
      title: `${company} ${['Platform', 'Enterprise', 'Cloud', 'Analytics', 'Security'][Math.floor(rand() * 5)]} Deal`,
      company,
      value,
      owner: OWNERS[Math.floor(rand() * OWNERS.length)],
      stage,
      // BUG: Some deals get createdAt set to exactly now (daysAgo=0 due to floor),
      // causing NaN in "days in stage" calculation because (now - now) / 86400000 = 0,
      // and the display does Math.floor(0) which shows "0 days" instead of "today"
      createdAt: Date.now() - daysAgo * 86400000,
      stageEnteredAt: Date.now() - stageAgo * 86400000,
      closeDate: new Date(Date.now() + (30 + Math.floor(rand() * 90)) * 86400000).toISOString().split('T')[0],
      contactName: i % 3 === 0 ? '' : `Contact ${i}`,
      contactEmail: i % 3 === 0 ? '' : `contact${i}@${company.toLowerCase()}.com`,
      notes: i % 4 === 0 ? '' : 'Initial discovery call completed',
      activities: [
        {
          id: `act-${i}-0`,
          type: 'stage_change',
          message: `Deal entered ${stage}`,
          actor: OWNERS[Math.floor(rand() * OWNERS.length)],
          timestamp: Date.now() - stageAgo * 86400000,
        },
      ],
      priority: (['low', 'medium', 'high'] as const)[Math.floor(rand() * 3)],
      probability: STAGES.find((s) => s.id === stage)?.probability || 0,
      products: i % 2 === 0 ? ['Enterprise'] : [],
    })
  }
  return deals
}

// ── State ──────────────────────────────────────────────────────────────
interface PipelineState {
  deals: DealCard[]
  dragging: { dealId: string; fromStage: StageId } | null
  dragOverStage: StageId | null
  editingDeal: DealCard | null
  gateDialog: { dealId: string; targetStage: StageId; missingFields: string[] } | null
  gateOverrides: Record<string, string>
  showForecast: boolean
  filterOwner: string
  filterPriority: string
  newDealOpen: boolean
  // BUG: forecast state is derived from deals but cached separately,
  // and moving a card BACK from closed_won doesn't update this cache
  forecastCache: Partial<Record<StageId, number>>
}

type PipelineAction =
  | { type: 'START_DRAG'; dealId: string; fromStage: StageId }
  | { type: 'DRAG_OVER'; stageId: StageId }
  | { type: 'DROP'; targetStage: StageId }
  | { type: 'CANCEL_DRAG' }
  | { type: 'MOVE_DEAL'; dealId: string; targetStage: StageId }
  | { type: 'SET_EDITING'; deal: DealCard | null }
  | { type: 'UPDATE_DEAL'; deal: DealCard }
  | { type: 'DELETE_DEAL'; dealId: string }
  | { type: 'ADD_DEAL'; deal: DealCard }
  | { type: 'SHOW_GATE'; dealId: string; targetStage: StageId; missingFields: string[] }
  | { type: 'DISMISS_GATE' }
  | { type: 'SET_GATE_OVERRIDE'; field: string; value: string }
  | { type: 'FORCE_MOVE'; dealId: string; targetStage: StageId }
  | { type: 'TOGGLE_FORECAST' }
  | { type: 'SET_FILTER_OWNER'; owner: string }
  | { type: 'SET_FILTER_PRIORITY'; priority: string }
  | { type: 'TOGGLE_NEW_DEAL' }

function pipelineReducer(state: PipelineState, action: PipelineAction): PipelineState {
  switch (action.type) {
    case 'START_DRAG':
      return { ...state, dragging: { dealId: action.dealId, fromStage: action.fromStage } }

    case 'DRAG_OVER':
      return { ...state, dragOverStage: action.stageId }

    case 'DROP': {
      if (!state.dragging) return state
      const deal = state.deals.find((d) => d.id === state.dragging!.dealId)
      if (!deal) return { ...state, dragging: null, dragOverStage: null }

      const targetStage = STAGES.find((s) => s.id === action.targetStage)!
      const missingFields = targetStage.requiredFields.filter((field) => {
        const val = deal[field as keyof DealCard]
        if (Array.isArray(val)) return val.length === 0
        // BUG: Stage gate validation passes if field was PREVIOUSLY filled
        // then cleared — checking truthiness of empty string '' returns false,
        // but checking `val !== undefined` returns true for empty strings.
        // So a cleared field still passes the gate check.
        return !val
      })

      const isForward = STAGES.findIndex((s) => s.id === action.targetStage) > STAGES.findIndex((s) => s.id === deal.stage)

      if (isForward && missingFields.length > 0) {
        return {
          ...state,
          dragging: null,
          dragOverStage: null,
          gateDialog: { dealId: deal.id, targetStage: action.targetStage, missingFields },
          gateOverrides: {},
        }
      }

      return moveDeal(state, deal.id, action.targetStage)
    }

    case 'CANCEL_DRAG':
      return { ...state, dragging: null, dragOverStage: null }

    case 'MOVE_DEAL':
      return moveDeal(state, action.dealId, action.targetStage)

    case 'SET_EDITING':
      return { ...state, editingDeal: action.deal }

    case 'UPDATE_DEAL':
      return {
        ...state,
        deals: state.deals.map((d) => (d.id === action.deal.id ? action.deal : d)),
        editingDeal: null,
      }

    case 'DELETE_DEAL':
      return {
        ...state,
        deals: state.deals.filter((d) => d.id !== action.dealId),
        editingDeal: null,
      }

    case 'ADD_DEAL':
      return { ...state, deals: [...state.deals, action.deal], newDealOpen: false }

    case 'SHOW_GATE':
      return {
        ...state,
        gateDialog: { dealId: action.dealId, targetStage: action.targetStage, missingFields: action.missingFields },
        gateOverrides: {},
      }

    case 'DISMISS_GATE':
      return { ...state, gateDialog: null, gateOverrides: {} }

    case 'SET_GATE_OVERRIDE':
      return { ...state, gateOverrides: { ...state.gateOverrides, [action.field]: action.value } }

    case 'FORCE_MOVE': {
      const deal = state.deals.find((d) => d.id === action.dealId)
      if (!deal) return state
      const updated = { ...deal }
      Object.entries(state.gateOverrides).forEach(([field, value]) => {
        ;(updated as any)[field] = field === 'products' ? value.split(',').map((s: string) => s.trim()) : value
      })
      const newState = {
        ...state,
        deals: state.deals.map((d) => (d.id === action.dealId ? updated : d)),
        gateDialog: null,
        gateOverrides: {},
      }
      return moveDeal(newState, action.dealId, action.targetStage)
    }

    case 'TOGGLE_FORECAST':
      return { ...state, showForecast: !state.showForecast }

    case 'SET_FILTER_OWNER':
      return { ...state, filterOwner: action.owner }

    case 'SET_FILTER_PRIORITY':
      return { ...state, filterPriority: action.priority }

    case 'TOGGLE_NEW_DEAL':
      return { ...state, newDealOpen: !state.newDealOpen }

    default:
      return state
  }
}

function moveDeal(state: PipelineState, dealId: string, targetStage: StageId): PipelineState {
  const stage = STAGES.find((s) => s.id === targetStage)!
  const deal = state.deals.find((d) => d.id === dealId)!
  const fromStage = deal.stage

  const updatedDeal: DealCard = {
    ...deal,
    stage: targetStage,
    stageEnteredAt: Date.now(),
    probability: stage.probability,
    activities: [
      {
        id: `act-${Date.now()}`,
        type: 'stage_change',
        message: `Moved from ${STAGES.find((s) => s.id === fromStage)?.label} to ${stage.label}`,
        actor: 'Current User',
        timestamp: Date.now(),
      },
      ...deal.activities,
    ],
  }

  const newDeals = state.deals.map((d) => (d.id === dealId ? updatedDeal : d))

  // BUG: Moving card TO closed_won adds to forecast cache,
  // but moving it BACK doesn't subtract. The forecastCache only gets
  // ADDED to, never reduced. On page refresh it recalculates correctly.
  const newForecast = { ...state.forecastCache }
  if (targetStage === 'closed_won') {
    newForecast.closed_won = (newForecast.closed_won || 0) + deal.value
  }
  // Missing: if (fromStage === 'closed_won') { newForecast.closed_won -= deal.value }

  // BUG: Moving a card between stages resets the position/order of ALL
  // cards in the target column. Cards get re-sorted by creation date
  // instead of preserving their visual order within the column.
  return {
    ...state,
    deals: newDeals,
    dragging: null,
    dragOverStage: null,
    forecastCache: newForecast,
  }
}

// ── Main Component ─────────────────────────────────────────────────────
export default function PipelineLab() {
  const [state, dispatch] = useReducer(pipelineReducer, {
    deals: generateDeals(),
    dragging: null,
    dragOverStage: null,
    editingDeal: null,
    gateDialog: null,
    gateOverrides: {},
    showForecast: true,
    filterOwner: '',
    filterPriority: '',
    newDealOpen: false,
    forecastCache: {},
  })

  const [newDeal, setNewDeal] = useState({ title: '', company: '', value: '', owner: OWNERS[0] })

  const filteredDeals = useMemo(() => {
    return state.deals.filter((d) => {
      if (state.filterOwner && d.owner !== state.filterOwner) return false
      if (state.filterPriority && d.priority !== state.filterPriority) return false
      return true
    })
  }, [state.deals, state.filterOwner, state.filterPriority])

  const dealsByStage = useMemo(() => {
    const grouped: Record<StageId, DealCard[]> = {
      lead: [], qualified: [], proposal: [], negotiation: [], closed_won: [], closed_lost: [],
    }
    filteredDeals.forEach((d) => grouped[d.stage].push(d))
    // Sort by creation date within each stage
    Object.values(grouped).forEach((arr) => arr.sort((a, b) => b.createdAt - a.createdAt))
    return grouped
  }, [filteredDeals])

  const forecast = useMemo(() => {
    const result: Record<StageId, { count: number; total: number; weighted: number }> = {} as any
    STAGES.forEach((stage) => {
      const deals = dealsByStage[stage.id] || []
      result[stage.id] = {
        count: deals.length,
        total: deals.reduce((s, d) => s + d.value, 0),
        weighted: deals.reduce((s, d) => s + d.value * (d.probability / 100), 0),
      }
    })
    return result
  }, [dealsByStage])

  const totalPipeline = useMemo(
    () => Object.values(forecast).reduce((s, f) => s + f.total, 0),
    [forecast]
  )

  const totalWeighted = useMemo(
    () => Object.values(forecast).reduce((s, f) => s + f.weighted, 0),
    [forecast]
  )

  const handleAddDeal = () => {
    if (!newDeal.title || !newDeal.company) return
    dispatch({
      type: 'ADD_DEAL',
      deal: {
        id: `deal-${Date.now()}`,
        title: newDeal.title,
        company: newDeal.company,
        value: parseInt(newDeal.value) || 0,
        owner: newDeal.owner,
        stage: 'lead',
        createdAt: Date.now(),
        stageEnteredAt: Date.now(),
        closeDate: '',
        contactName: '',
        contactEmail: '',
        notes: '',
        activities: [{
          id: `act-${Date.now()}`,
          type: 'stage_change',
          message: 'Deal created',
          actor: 'Current User',
          timestamp: Date.now(),
        }],
        priority: 'medium',
        probability: 10,
        products: [],
      },
    })
    setNewDeal({ title: '', company: '', value: '', owner: OWNERS[0] })
  }

  function daysInStage(deal: DealCard): string {
    const diff = Date.now() - deal.stageEnteredAt
    const days = Math.floor(diff / 86400000)
    // BUG: For deals created today, diff could be very small (< 86400000),
    // making days = 0. Display shows "0d" which is correct but inconsistent
    // with the tooltip that says "entered X ago" using a different calculation
    // that sometimes shows negative time for timezone edge cases
    return `${days}d`
  }

  return (
    <div className="space-y-4" data-testid="pipeline-board">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {filteredDeals.length} deals · ${totalPipeline.toLocaleString()} total · ${totalWeighted.toLocaleString()} weighted
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={state.filterOwner}
            onChange={(e) => dispatch({ type: 'SET_FILTER_OWNER', owner: e.target.value })}
            className="rounded-md border px-2 py-1.5 text-sm"
            data-testid="filter-owner"
          >
            <option value="">All owners</option>
            {OWNERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select
            value={state.filterPriority}
            onChange={(e) => dispatch({ type: 'SET_FILTER_PRIORITY', priority: e.target.value })}
            className="rounded-md border px-2 py-1.5 text-sm"
            data-testid="filter-priority"
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FORECAST' })}
            data-testid="toggle-forecast-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm ${
              state.showForecast ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Forecast
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_NEW_DEAL' })}
            data-testid="new-deal-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> New deal
          </button>
        </div>
      </div>

      {/* Forecast Bar */}
      {state.showForecast && (
        <div className="border rounded-lg p-4" data-testid="forecast-panel">
          <div className="flex items-center gap-4 mb-3">
            <div>
              <div className="text-xs text-muted-foreground">Total pipeline</div>
              <div className="text-lg font-bold" data-testid="total-pipeline">${totalPipeline.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Weighted forecast</div>
              <div className="text-lg font-bold" data-testid="weighted-forecast">${totalWeighted.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Closed won</div>
              <div className="text-lg font-bold text-green-600" data-testid="closed-won-total">
                ${(state.forecastCache.closed_won || forecast.closed_won?.total || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted" data-testid="forecast-bar">
            {STAGES.filter((s) => s.id !== 'closed_lost').map((stage) => {
              const pct = totalPipeline > 0 ? (forecast[stage.id]?.total / totalPipeline) * 100 : 0
              return (
                <div
                  key={stage.id}
                  className={`${stage.bgColor} border-r border-white last:border-r-0`}
                  style={{ width: `${pct}%` }}
                  title={`${stage.label}: $${forecast[stage.id]?.total.toLocaleString()}`}
                  data-testid={`forecast-segment-${stage.id}`}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* New Deal Form */}
      {state.newDealOpen && (
        <div className="border rounded-lg p-4 space-y-3" data-testid="new-deal-form">
          <h3 className="text-sm font-semibold">Create new deal</h3>
          <div className="grid grid-cols-4 gap-3">
            <input
              value={newDeal.title}
              onChange={(e) => setNewDeal((p) => ({ ...p, title: e.target.value }))}
              placeholder="Deal title"
              data-testid="new-deal-title"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              value={newDeal.company}
              onChange={(e) => setNewDeal((p) => ({ ...p, company: e.target.value }))}
              placeholder="Company"
              data-testid="new-deal-company"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              value={newDeal.value}
              onChange={(e) => setNewDeal((p) => ({ ...p, value: e.target.value }))}
              placeholder="Value ($)"
              type="number"
              data-testid="new-deal-value"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <select
              value={newDeal.owner}
              onChange={(e) => setNewDeal((p) => ({ ...p, owner: e.target.value }))}
              data-testid="new-deal-owner"
              className="rounded-md border px-3 py-2 text-sm"
            >
              {OWNERS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddDeal}
              disabled={!newDeal.title || !newDeal.company}
              data-testid="confirm-new-deal-btn"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              Create deal
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_NEW_DEAL' })}
              className="px-4 py-2 rounded-md border text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4" data-testid="kanban-board">
        {STAGES.map((stage) => {
          const deals = dealsByStage[stage.id]
          const stageTotal = deals.reduce((s, d) => s + d.value, 0)
          const isDragOver = state.dragOverStage === stage.id

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-72 rounded-lg border ${
                isDragOver ? 'border-primary bg-primary/5' : 'bg-card'
              }`}
              data-testid={`stage-column-${stage.id}`}
              onDragOver={(e) => {
                e.preventDefault()
                dispatch({ type: 'DRAG_OVER', stageId: stage.id })
              }}
              onDragLeave={() => dispatch({ type: 'CANCEL_DRAG' })}
              onDrop={(e) => {
                e.preventDefault()
                dispatch({ type: 'DROP', targetStage: stage.id })
              }}
            >
              {/* Column Header */}
              <div className="px-3 py-2.5 border-b" data-testid={`stage-header-${stage.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${stage.color}`}>{stage.label}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {deals.length}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">${stageTotal.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.bgColor.replace('bg-', 'bg-')}`}
                    style={{ width: `${stage.probability}%`, backgroundColor: stage.color.replace('text-', '').replace('-600', '') }}
                  />
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto" data-testid={`stage-cards-${stage.id}`}>
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => dispatch({ type: 'START_DRAG', dealId: deal.id, fromStage: stage.id })}
                    onDragEnd={() => dispatch({ type: 'CANCEL_DRAG' })}
                    onClick={() => dispatch({ type: 'SET_EDITING', deal })}
                    className={`rounded-md border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition group ${
                      state.dragging?.dealId === deal.id ? 'opacity-50' : ''
                    }`}
                    data-testid={`deal-card-${deal.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-sm font-medium leading-tight truncate">{deal.title}</h4>
                      <span
                        className={`flex-shrink-0 h-2 w-2 rounded-full ${
                          deal.priority === 'high' ? 'bg-red-500' : deal.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                        title={deal.priority}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{deal.company}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">${deal.value.toLocaleString()}</span>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          <span data-testid={`days-in-stage-${deal.id}`}>{daysInStage(deal)}</span>
                        </span>
                        <span className="flex items-center gap-0.5">
                          <User className="h-3 w-3" />
                          {deal.owner.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                    {deal.products.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {deal.products.map((p) => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stage Gate Dialog */}
      {state.gateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-testid="gate-dialog-overlay">
          <div className="bg-card rounded-lg border shadow-xl w-[480px] p-6 space-y-4" data-testid="gate-dialog">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Stage gate requirements</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  The following fields are required to move to{' '}
                  <strong>{STAGES.find((s) => s.id === state.gateDialog!.targetStage)?.label}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {state.gateDialog.missingFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                  {field === 'products' ? (
                    <div className="flex flex-wrap gap-2" data-testid={`gate-field-${field}`}>
                      {PRODUCT_OPTIONS.map((p) => {
                        const selected = (state.gateOverrides.products || '').split(',').map((s: string) => s.trim()).includes(p)
                        return (
                          <button
                            key={p}
                            onClick={() => {
                              const current = (state.gateOverrides.products || '').split(',').map((s: string) => s.trim()).filter(Boolean)
                              const next = selected ? current.filter((c: string) => c !== p) : [...current, p]
                              dispatch({ type: 'SET_GATE_OVERRIDE', field: 'products', value: next.join(', ') })
                            }}
                            className={`px-2 py-1 rounded text-xs border ${
                              selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      })}
                    </div>
                  ) : field === 'closeDate' ? (
                    <input
                      type="date"
                      value={state.gateOverrides[field] || ''}
                      onChange={(e) => dispatch({ type: 'SET_GATE_OVERRIDE', field, value: e.target.value })}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      data-testid={`gate-field-${field}`}
                    />
                  ) : (
                    <input
                      value={state.gateOverrides[field] || ''}
                      onChange={(e) => dispatch({ type: 'SET_GATE_OVERRIDE', field, value: e.target.value })}
                      placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      data-testid={`gate-field-${field}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => dispatch({ type: 'DISMISS_GATE' })}
                className="px-4 py-2 rounded-md border text-sm"
                data-testid="gate-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch({
                    type: 'FORCE_MOVE',
                    dealId: state.gateDialog!.dealId,
                    targetStage: state.gateDialog!.targetStage,
                  })
                }}
                disabled={state.gateDialog.missingFields.some((f) => !state.gateOverrides[f])}
                data-testid="gate-proceed-btn"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                Fill & move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deal Slide-out */}
      {state.editingDeal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => {
              // BUG: Clicking outside the panel to close it does NOT save
              // any unsaved changes. Only the explicit "Save" button persists.
              // But there's no unsaved changes indicator, so users lose edits silently.
              dispatch({ type: 'SET_EDITING', deal: null })
            }}
            data-testid="edit-overlay"
          />
          <DealEditPanel
            deal={state.editingDeal}
            onSave={(deal) => dispatch({ type: 'UPDATE_DEAL', deal })}
            onDelete={(id) => dispatch({ type: 'DELETE_DEAL', dealId: id })}
            onClose={() => dispatch({ type: 'SET_EDITING', deal: null })}
          />
        </>
      )}
    </div>
  )
}

// ── Deal Edit Panel ────────────────────────────────────────────────────
function DealEditPanel({
  deal,
  onSave,
  onDelete,
  onClose,
}: {
  deal: DealCard
  onSave: (deal: DealCard) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...deal })
  const [activeSection, setActiveSection] = useState<'details' | 'activity'>('details')
  const [newNote, setNewNote] = useState('')

  const update = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }))

  const addNote = () => {
    if (!newNote.trim()) return
    setForm((p) => ({
      ...p,
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'note' as const,
          message: newNote,
          actor: 'Current User',
          timestamp: Date.now(),
        },
        ...p.activities,
      ],
    }))
    setNewNote('')
  }

  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-50 w-[480px] bg-card border-l shadow-2xl overflow-y-auto"
      data-testid="deal-edit-panel"
    >
      <div className="sticky top-0 bg-card border-b px-5 py-3 flex items-center justify-between z-10">
        <h3 className="font-semibold truncate">{form.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSave(form)}
            data-testid="save-edit-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
          >
            <Check className="h-3.5 w-3.5" /> Save
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Section toggle */}
        <div className="flex gap-4 border-b" data-testid="edit-sections">
          {(['details', 'activity'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`pb-2 text-sm font-medium border-b-2 -mb-px ${
                activeSection === sec ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
              }`}
              data-testid={`edit-section-${sec}`}
            >
              {sec === 'details' ? 'Details' : 'Activity'}
            </button>
          ))}
        </div>

        {activeSection === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                data-testid="edit-title"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  data-testid="edit-company"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value ($)</label>
                <input
                  type="number"
                  value={form.value}
                  onChange={(e) => update('value', parseInt(e.target.value) || 0)}
                  data-testid="edit-value"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Contact name</label>
                <input
                  value={form.contactName}
                  onChange={(e) => update('contactName', e.target.value)}
                  data-testid="edit-contact-name"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => update('contactEmail', e.target.value)}
                  data-testid="edit-contact-email"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Owner</label>
                <select
                  value={form.owner}
                  onChange={(e) => update('owner', e.target.value)}
                  data-testid="edit-owner"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  {OWNERS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => update('priority', e.target.value)}
                  data-testid="edit-priority"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Close date</label>
              <input
                type="date"
                value={form.closeDate}
                onChange={(e) => update('closeDate', e.target.value)}
                data-testid="edit-close-date"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Products</label>
              <div className="flex flex-wrap gap-2" data-testid="edit-products">
                {PRODUCT_OPTIONS.map((p) => {
                  const selected = form.products.includes(p)
                  return (
                    <button
                      key={p}
                      onClick={() =>
                        update('products', selected ? form.products.filter((x) => x !== p) : [...form.products, p])
                      }
                      data-testid={`product-toggle-${p.toLowerCase()}`}
                      className={`px-2.5 py-1 rounded-md text-xs border ${
                        selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                data-testid="edit-notes"
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              />
            </div>

            <div className="pt-2 border-t">
              <button
                onClick={() => onDelete(form.id)}
                data-testid="delete-deal-btn"
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" /> Delete deal
              </button>
            </div>
          </div>
        )}

        {activeSection === 'activity' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                data-testid="activity-note-input"
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                data-testid="add-activity-note-btn"
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="space-y-3" data-testid="activity-timeline">
              {form.activities.map((activity) => (
                <div key={activity.id} className="flex gap-3" data-testid={`activity-${activity.id}`}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'note'
                          ? 'bg-blue-100'
                          : activity.type === 'stage_change'
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {activity.type === 'note' ? (
                        <MessageSquare className="h-3 w-3 text-blue-600" />
                      ) : activity.type === 'stage_change' ? (
                        <ArrowRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <User className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                    <div className="w-px flex-1 bg-border mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.actor} · {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
