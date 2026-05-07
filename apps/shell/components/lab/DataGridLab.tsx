'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Copy,
  Download,
  Filter,
  Edit2,
  Search,
  Settings,
  Trash2,
  X,
  Bookmark,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────
type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'status' | 'email' | 'percentage'

interface Column {
  id: string
  label: string
  type: ColumnType
  width: number
  visible: boolean
  pinned: boolean
  sortable: boolean
  filterable: boolean
}

type SortDirection = 'asc' | 'desc'

interface SortEntry {
  columnId: string
  direction: SortDirection
  // BUG: Sort click counter tracked here — after 3rd click on same column,
  // icon shows 'asc' but actual sort is 'desc' due to off-by-one in toggle cycle
  clicks: number
}

interface FilterEntry {
  columnId: string
  operator: 'contains' | 'equals' | 'gt' | 'lt' | 'between' | 'empty' | 'not_empty'
  value: string
  value2?: string
}

interface CellEdit {
  rowId: string
  columnId: string
  value: string
}

type RowData = Record<string, any> & { id: string; _selected?: boolean; _tag?: string }

// ── Data Generation ────────────────────────────────────────────────────
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Parker', 'Drew', 'Sam', 'Jamie', 'Charlie', 'Robin', 'Pat', 'Lee', 'Sage', 'Blake', 'Reese', 'Dana']
const LAST_NAMES = ['Smith', 'Patel', 'Chen', 'Garcia', 'Kim', 'Singh', 'Mueller', 'Tanaka', 'Santos', 'Dubois', 'Wilson', 'Brown', 'Davis', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Jackson']
const COMPANIES = ['Acme Corp', 'Globex Inc', 'Initech', 'Wayne Enterprises', 'Stark Industries', 'Oscorp', 'LexCorp', 'Umbrella Corp', 'Cyberdyne', 'Weyland-Yutani', 'Massive Dynamic', 'Aperture Science', 'Tyrell Corp', 'Soylent Corp', 'Vought International']
const STATUSES = ['Active', 'Inactive', 'Pending', 'Churned', 'Trial']
const TAGS = ['Enterprise', 'SMB', 'Startup', 'Government', 'Education']
const DOMAINS = ['com', 'io', 'co', 'net', 'org']

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateRows(count: number): RowData[] {
  const rand = seededRandom(42)
  const rows: RowData[] = []
  for (let i = 0; i < count; i++) {
    const fn = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const ln = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    const company = COMPANIES[Math.floor(rand() * COMPANIES.length)]
    const domain = DOMAINS[Math.floor(rand() * DOMAINS.length)]
    const revenue = Math.floor(rand() * 500000) + 1000
    const growth = Math.floor(rand() * 200 - 50)
    const daysAgo = Math.floor(rand() * 730)
    const created = new Date(Date.now() - daysAgo * 86400000)

    rows.push({
      id: `row-${i}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.${domain}`,
      company,
      revenue,
      growth,
      status: STATUSES[Math.floor(rand() * STATUSES.length)],
      created: created.toISOString().split('T')[0],
      health: Math.floor(rand() * 100),
      _selected: false,
    })
  }
  return rows
}

const DEFAULT_COLUMNS: Column[] = [
  { id: 'name', label: 'Name', type: 'text', width: 180, visible: true, pinned: false, sortable: true, filterable: true },
  { id: 'email', label: 'Email', type: 'email', width: 240, visible: true, pinned: false, sortable: true, filterable: true },
  { id: 'company', label: 'Company', type: 'text', width: 160, visible: true, pinned: false, sortable: true, filterable: true },
  { id: 'revenue', label: 'Revenue', type: 'currency', width: 130, visible: true, pinned: false, sortable: true, filterable: true },
  { id: 'growth', label: 'Growth', type: 'percentage', width: 100, visible: true, pinned: false, sortable: true, filterable: true },
  { id: 'status', label: 'Status', type: 'status', width: 110, visible: true, pinned: false, sortable: true, filterable: true },
  { id: 'created', label: 'Created', type: 'date', width: 120, visible: true, pinned: false, sortable: true, filterable: true },
  { id: 'health', label: 'Health', type: 'number', width: 90, visible: true, pinned: false, sortable: true, filterable: true },
]

const ROW_HEIGHT = 40
const HEADER_HEIGHT = 44
const OVERSCAN = 10

// ── State ──────────────────────────────────────────────────────────────
interface GridState {
  rows: RowData[]
  columns: Column[]
  sorts: SortEntry[]
  filters: FilterEntry[]
  editing: CellEdit | null
  selectedIds: Set<string>
  lastSelectedId: string | null
  contextMenu: { x: number; y: number; rowId: string } | null
  columnSettingsOpen: boolean
  filterPanelOpen: boolean
  searchQuery: string
  bulkTag: string
}

type GridAction =
  | { type: 'SET_ROWS'; rows: RowData[] }
  | { type: 'TOGGLE_SORT'; columnId: string; multi: boolean }
  | { type: 'ADD_FILTER'; filter: FilterEntry }
  | { type: 'REMOVE_FILTER'; columnId: string }
  | { type: 'UPDATE_FILTER'; columnId: string; value: string; value2?: string }
  | { type: 'SET_EDITING'; edit: CellEdit | null }
  | { type: 'COMMIT_EDIT'; rowId: string; columnId: string; value: string }
  | { type: 'SELECT_ROW'; rowId: string; shift: boolean; ctrl: boolean }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'DELETE_SELECTED' }
  | { type: 'TAG_SELECTED'; tag: string }
  | { type: 'TOGGLE_COLUMN'; columnId: string }
  | { type: 'TOGGLE_PIN'; columnId: string }
  | { type: 'RESIZE_COLUMN'; columnId: string; width: number }
  | { type: 'SET_CONTEXT_MENU'; menu: GridState['contextMenu'] }
  | { type: 'TOGGLE_COLUMN_SETTINGS' }
  | { type: 'TOGGLE_FILTER_PANEL' }
  | { type: 'SET_SEARCH'; query: string }

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case 'SET_ROWS':
      return { ...state, rows: action.rows }

    case 'TOGGLE_SORT': {
      const existing = state.sorts.find((s) => s.columnId === action.columnId)
      let newSorts: SortEntry[]

      if (existing) {
        const newClicks = existing.clicks + 1
        if (newClicks >= 3) {
          // Remove sort on 3rd click
          newSorts = state.sorts.filter((s) => s.columnId !== action.columnId)
        } else {
          newSorts = state.sorts.map((s) =>
            s.columnId === action.columnId
              ? {
                  ...s,
                  // BUG: After toggling asc→desc→remove cycle, the direction
                  // state gets out of sync with the icon. The icon reads from
                  // `clicks % 2` but the actual sort uses `direction` field
                  direction: s.direction === 'asc' ? 'desc' : 'asc',
                  clicks: newClicks,
                }
              : s
          )
        }
      } else {
        const newEntry: SortEntry = { columnId: action.columnId, direction: 'asc', clicks: 1 }
        newSorts = action.multi ? [...state.sorts, newEntry] : [newEntry]
      }

      // BUG: Multi-column sort doesn't persist after filter change.
      // When filters are active and sort is toggled, filters array ref
      // changes causing the sort to reset to single-column.
      return { ...state, sorts: newSorts }
    }

    case 'ADD_FILTER':
      return {
        ...state,
        filters: [...state.filters.filter((f) => f.columnId !== action.filter.columnId), action.filter],
        // BUG: Adding a filter resets sorts to first entry only
        sorts: state.sorts.length > 1 ? [state.sorts[0]] : state.sorts,
      }

    case 'REMOVE_FILTER':
      return { ...state, filters: state.filters.filter((f) => f.columnId !== action.columnId) }

    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: state.filters.map((f) =>
          f.columnId === action.columnId ? { ...f, value: action.value, value2: action.value2 } : f
        ),
      }

    case 'SET_EDITING':
      return { ...state, editing: action.edit }

    case 'COMMIT_EDIT': {
      // BUG: If a filter is active and the user edits a cell, the commit
      // uses the VISUAL row index, not the actual row ID. This means if
      // filtered view shows row at visual position 5, but it's actually
      // row 47 in the full dataset, the edit goes to row 5 of unfiltered data.
      return {
        ...state,
        rows: state.rows.map((r) =>
          r.id === action.rowId ? { ...r, [action.columnId]: action.value } : r
        ),
        editing: null,
      }
    }

    case 'SELECT_ROW': {
      const newSelected = new Set(state.selectedIds)
      if (action.shift && state.lastSelectedId) {
        const allIds = state.rows.map((r) => r.id)
        const lastIdx = allIds.indexOf(state.lastSelectedId)
        const curIdx = allIds.indexOf(action.rowId)
        if (lastIdx !== -1 && curIdx !== -1) {
          const [start, end] = lastIdx < curIdx ? [lastIdx, curIdx] : [curIdx, lastIdx]
          // BUG: Shift+click range select uses unfiltered row indices,
          // so if the grid is filtered, the range includes hidden rows.
          // User sees 10 rows, shift+clicks from row 1 to row 10,
          // but actually selects rows 1-10 of the FULL dataset.
          for (let i = start; i <= end; i++) {
            newSelected.add(allIds[i])
          }
        }
      } else if (action.ctrl) {
        if (newSelected.has(action.rowId)) newSelected.delete(action.rowId)
        else newSelected.add(action.rowId)
      } else {
        newSelected.clear()
        newSelected.add(action.rowId)
      }
      return { ...state, selectedIds: newSelected, lastSelectedId: action.rowId }
    }

    case 'SELECT_ALL': {
      // BUG: Selects only visible rows but the status bar says "all X rows selected"
      // using the TOTAL count, not the filtered count
      const newSelected = new Set(state.rows.map((r) => r.id))
      return { ...state, selectedIds: newSelected }
    }

    case 'DESELECT_ALL':
      return { ...state, selectedIds: new Set(), lastSelectedId: null }

    case 'DELETE_SELECTED':
      return {
        ...state,
        rows: state.rows.filter((r) => !state.selectedIds.has(r.id)),
        selectedIds: new Set(),
        lastSelectedId: null,
      }

    case 'TAG_SELECTED':
      return {
        ...state,
        rows: state.rows.map((r) =>
          state.selectedIds.has(r.id) ? { ...r, _tag: action.tag } : r
        ),
      }

    case 'TOGGLE_COLUMN':
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, visible: !c.visible } : c
        ),
      }

    case 'TOGGLE_PIN':
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, pinned: !c.pinned } : c
        ),
      }

    case 'RESIZE_COLUMN':
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, width: Math.max(60, action.width) } : c
        ),
      }

    case 'SET_CONTEXT_MENU':
      return { ...state, contextMenu: action.menu }

    case 'TOGGLE_COLUMN_SETTINGS':
      return { ...state, columnSettingsOpen: !state.columnSettingsOpen }

    case 'TOGGLE_FILTER_PANEL':
      return { ...state, filterPanelOpen: !state.filterPanelOpen }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }

    default:
      return state
  }
}

// ── Helpers ────────────────────────────────────────────────────────────
function applyFilters(rows: RowData[], filters: FilterEntry[]): RowData[] {
  return rows.filter((row) => {
    return filters.every((f) => {
      const val = row[f.columnId]
      const strVal = String(val ?? '').toLowerCase()
      const filterVal = f.value.toLowerCase()

      switch (f.operator) {
        case 'contains':
          return strVal.includes(filterVal)
        case 'equals':
          return strVal === filterVal
        case 'gt':
          // BUG: "greater than" on string columns does string comparison
          // instead of numeric — "9" > "10" is true in string land
          return val > (isNaN(Number(f.value)) ? f.value : Number(f.value))
        case 'lt':
          return val < (isNaN(Number(f.value)) ? f.value : Number(f.value))
        case 'empty':
          return !val || strVal === ''
        case 'not_empty':
          return !!val && strVal !== ''
        default:
          return true
      }
    })
  })
}

function applySorts(rows: RowData[], sorts: SortEntry[]): RowData[] {
  if (sorts.length === 0) return rows
  return [...rows].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = a[sort.columnId]
      const bVal = b[sort.columnId]

      // BUG: Date column sorts by string comparison, not actual date value.
      // "2024-02-01" < "2024-12-31" works by luck with ISO format,
      // but "Jan 15" < "Feb 1" would break. And mixing formats is chaos.
      let cmp: number
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''))
      }

      if (cmp !== 0) {
        // BUG: Uses clicks parity for icon but direction field for actual sort.
        // After asc→desc toggle, icon shows from clicks%2 but sort uses direction.
        return sort.direction === 'asc' ? cmp : -cmp
      }
    }
    return 0
  })
}

function applySearch(rows: RowData[], query: string): RowData[] {
  if (!query.trim()) return rows
  const q = query.toLowerCase()
  return rows.filter((row) =>
    Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
  )
}

// ── Cell Renderer ──────────────────────────────────────────────────────
function CellContent({ column, value }: { column: Column; value: any }) {
  switch (column.type) {
    case 'currency':
      return <span>${Number(value).toLocaleString('en-US')}</span>
    case 'percentage': {
      const num = Number(value)
      return (
        <span className={num >= 0 ? 'text-green-600' : 'text-red-600'}>
          {num >= 0 ? '+' : ''}{num}%
        </span>
      )
    }
    case 'status': {
      const colors: Record<string, string> = {
        Active: 'bg-green-100 text-green-700',
        Inactive: 'bg-gray-100 text-gray-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Churned: 'bg-red-100 text-red-700',
        Trial: 'bg-blue-100 text-blue-700',
      }
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100'}`}>
          {value}
        </span>
      )
    }
    case 'email':
      return <span className="text-blue-600 underline">{value}</span>
    case 'number':
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                Number(value) >= 70 ? 'bg-green-500' : Number(value) >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }}
            />
          </div>
          <span className="text-xs w-8 text-right">{value}</span>
        </div>
      )
    default:
      return <span>{String(value ?? '')}</span>
  }
}

// ── Main Component ─────────────────────────────────────────────────────
export default function DataGridLab() {
  const [state, dispatch] = useReducer(gridReducer, {
    rows: generateRows(5000),
    columns: DEFAULT_COLUMNS,
    sorts: [],
    filters: [],
    editing: null,
    selectedIds: new Set<string>(),
    lastSelectedId: null,
    contextMenu: null,
    columnSettingsOpen: false,
    filterPanelOpen: false,
    searchQuery: '',
    bulkTag: '',
  })

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  const resizingRef = useRef<{ columnId: string; startX: number; startWidth: number } | null>(null)

  // Process rows
  const processedRows = useMemo(() => {
    let result = state.rows
    result = applySearch(result, state.searchQuery)
    result = applyFilters(result, state.filters)
    result = applySorts(result, state.sorts)
    return result
  }, [state.rows, state.searchQuery, state.filters, state.sorts])

  const visibleColumns = useMemo(
    () => state.columns.filter((c) => c.visible),
    [state.columns]
  )

  const totalWidth = useMemo(
    () => visibleColumns.reduce((sum, c) => sum + c.width, 0) + 44,
    [visibleColumns]
  )

  // Virtual scrolling
  const containerHeight = 600
  const totalHeight = processedRows.length * ROW_HEIGHT
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(processedRows.length, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN)
  const visibleRows = processedRows.slice(startIndex, endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  const handleScroll = useCallback((e: React.UIEvent) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        dispatch({ type: 'SELECT_ALL' })
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'SET_EDITING', edit: null })
        dispatch({ type: 'SET_CONTEXT_MENU', menu: null })
      }
      if (e.key === 'Delete' && state.selectedIds.size > 0) {
        dispatch({ type: 'DELETE_SELECTED' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.selectedIds])

  // Column resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return
      const delta = e.clientX - resizingRef.current.startX
      dispatch({
        type: 'RESIZE_COLUMN',
        columnId: resizingRef.current.columnId,
        width: resizingRef.current.startWidth + delta,
      })
    }
    const handleMouseUp = () => {
      resizingRef.current = null
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Focus edit input
  useEffect(() => {
    if (state.editing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [state.editing])

  const startEdit = (rowId: string, columnId: string, currentValue: any) => {
    setEditValue(String(currentValue ?? ''))
    dispatch({ type: 'SET_EDITING', edit: { rowId, columnId, value: String(currentValue ?? '') } })
  }

  const commitEdit = () => {
    if (state.editing) {
      dispatch({ type: 'COMMIT_EDIT', rowId: state.editing.rowId, columnId: state.editing.columnId, value: editValue })
    }
  }

  const handleExport = () => {
    // BUG: Export uses original column order even if columns were reordered
    // Also includes ALL rows even when filtered, but the toast says
    // "Exported X rows" using the filtered count
    const headers = visibleColumns.map((c) => c.label).join(',')
    const csvRows = state.rows.map((row) =>
      visibleColumns.map((c) => `"${String(row[c.id] ?? '').replace(/"/g, '""')}"`).join(',')
    )
    const csv = [headers, ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grid-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4" data-testid="data-grid">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics grid</h1>
          <p className="text-sm text-muted-foreground">
            {processedRows.length.toLocaleString()} of {state.rows.length.toLocaleString()} accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
              placeholder="Search all columns..."
              data-testid="grid-search"
              className="pl-9 pr-3 py-1.5 rounded-md border text-sm w-64"
            />
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FILTER_PANEL' })}
            data-testid="toggle-filters-btn"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm ${
              state.filterPanelOpen ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <Filter className="h-4 w-4" /> Filters
            {state.filters.length > 0 && (
              <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {state.filters.length}
              </span>
            )}
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_COLUMN_SETTINGS' })}
            data-testid="column-settings-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm"
          >
            <Settings className="h-4 w-4" /> Columns
          </button>
          <button
            onClick={handleExport}
            data-testid="export-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {state.filterPanelOpen && (
        <div className="border rounded-lg p-4 space-y-3" data-testid="filter-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Active filters</h3>
            <button
              onClick={() => state.filters.forEach((f) => dispatch({ type: 'REMOVE_FILTER', columnId: f.columnId }))}
              className="text-xs text-muted-foreground hover:text-foreground"
              data-testid="clear-all-filters"
            >
              Clear all
            </button>
          </div>
          {state.filters.map((f) => (
            <div key={f.columnId} className="flex items-center gap-2" data-testid={`filter-row-${f.columnId}`}>
              <span className="text-sm font-medium w-24">{state.columns.find((c) => c.id === f.columnId)?.label}</span>
              <select
                value={f.operator}
                onChange={(e) => {
                  dispatch({ type: 'REMOVE_FILTER', columnId: f.columnId })
                  dispatch({ type: 'ADD_FILTER', filter: { ...f, operator: e.target.value as FilterEntry['operator'] } })
                }}
                className="rounded-md border px-2 py-1 text-sm"
                data-testid={`filter-operator-${f.columnId}`}
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="gt">Greater than</option>
                <option value="lt">Less than</option>
                <option value="empty">Is empty</option>
                <option value="not_empty">Is not empty</option>
              </select>
              {!['empty', 'not_empty'].includes(f.operator) && (
                <input
                  value={f.value}
                  onChange={(e) => dispatch({ type: 'UPDATE_FILTER', columnId: f.columnId, value: e.target.value })}
                  className="rounded-md border px-2 py-1 text-sm flex-1"
                  placeholder="Filter value..."
                  data-testid={`filter-value-${f.columnId}`}
                />
              )}
              <button
                onClick={() => dispatch({ type: 'REMOVE_FILTER', columnId: f.columnId })}
                className="text-muted-foreground hover:text-destructive"
                data-testid={`remove-filter-${f.columnId}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            {state.columns
              .filter((c) => c.filterable && !state.filters.some((f) => f.columnId === c.id))
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    dispatch({ type: 'ADD_FILTER', filter: { columnId: c.id, operator: 'contains', value: '' } })
                  }
                  className="text-xs px-2 py-1 rounded-md border hover:bg-muted"
                  data-testid={`add-filter-${c.id}`}
                >
                  + {c.label}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Column Settings Panel */}
      {state.columnSettingsOpen && (
        <div className="border rounded-lg p-4" data-testid="column-settings-panel">
          <h3 className="text-sm font-semibold mb-3">Column visibility</h3>
          <div className="grid grid-cols-4 gap-2">
            {state.columns.map((col) => (
              <label key={col.id} className="flex items-center gap-2 text-sm" data-testid={`col-toggle-${col.id}`}>
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => dispatch({ type: 'TOGGLE_COLUMN', columnId: col.id })}
                  className="rounded"
                />
                {col.label}
                {col.pinned && <span className="text-[10px] text-muted-foreground">(pinned)</span>}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {state.selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border rounded-lg" data-testid="bulk-actions">
          <span className="text-sm font-medium" data-testid="selected-count">
            {state.selectedIds.size} of {state.rows.length} selected
          </span>
          <button
            onClick={() => dispatch({ type: 'DESELECT_ALL' })}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Deselect all
          </button>
          <div className="h-4 w-px bg-border" />
          <button
            onClick={() => dispatch({ type: 'DELETE_SELECTED' })}
            data-testid="bulk-delete-btn"
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <div className="flex items-center gap-1">
            <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              onChange={(e) => {
                if (e.target.value) dispatch({ type: 'TAG_SELECTED', tag: e.target.value })
              }}
              className="text-xs rounded border px-2 py-1"
              data-testid="bulk-tag-select"
              defaultValue=""
            >
              <option value="" disabled>Tag as...</option>
              {TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExport}
            data-testid="bulk-export-btn"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Export selected
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="border rounded-lg overflow-hidden">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-auto"
          style={{ height: containerHeight }}
          data-testid="grid-scroll-container"
        >
          <div style={{ width: totalWidth, height: totalHeight + HEADER_HEIGHT }}>
            {/* Header */}
            <div
              className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm flex border-b"
              style={{ height: HEADER_HEIGHT }}
              data-testid="grid-header"
            >
              <div className="w-11 flex items-center justify-center border-r flex-shrink-0">
                <input
                  type="checkbox"
                  checked={state.selectedIds.size === processedRows.length && processedRows.length > 0}
                  onChange={() =>
                    state.selectedIds.size === processedRows.length
                      ? dispatch({ type: 'DESELECT_ALL' })
                      : dispatch({ type: 'SELECT_ALL' })
                  }
                  data-testid="select-all-checkbox"
                  className="rounded"
                />
              </div>
              {visibleColumns.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center px-3 border-r text-xs font-medium text-muted-foreground relative group select-none"
                  style={{ width: col.width, minWidth: col.width }}
                  data-testid={`header-${col.id}`}
                >
                  <button
                    onClick={(e) => dispatch({ type: 'TOGGLE_SORT', columnId: col.id, multi: e.shiftKey })}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {col.label}
                    {(() => {
                      const sort = state.sorts.find((s) => s.columnId === col.id)
                      if (!sort) return <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
                      // BUG: Icon direction derived from clicks parity, not actual sort direction
                      return sort.clicks % 2 === 1 ? (
                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      )
                    })()}
                  </button>
                  {/* Resize handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                    onMouseDown={(e) => {
                      resizingRef.current = { columnId: col.id, startX: e.clientX, startWidth: col.width }
                      document.body.style.cursor = 'col-resize'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Body */}
            <div style={{ transform: `translateY(${offsetY}px)`, position: 'relative', top: HEADER_HEIGHT }}>
              {visibleRows.map((row, vi) => {
                const isSelected = state.selectedIds.has(row.id)
                return (
                  <div
                    key={row.id}
                    className={`flex border-b hover:bg-muted/30 ${isSelected ? 'bg-primary/5' : ''}`}
                    style={{ height: ROW_HEIGHT }}
                    data-testid={`row-${row.id}`}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      dispatch({ type: 'SET_CONTEXT_MENU', menu: { x: e.clientX, y: e.clientY, rowId: row.id } })
                    }}
                    onClick={(e) =>
                      dispatch({ type: 'SELECT_ROW', rowId: row.id, shift: e.shiftKey, ctrl: e.metaKey || e.ctrlKey })
                    }
                  >
                    <div className="w-11 flex items-center justify-center border-r flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => dispatch({ type: 'SELECT_ROW', rowId: row.id, shift: false, ctrl: true })}
                        data-testid={`checkbox-${row.id}`}
                        className="rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {visibleColumns.map((col) => {
                      const isEditing =
                        state.editing?.rowId === row.id && state.editing?.columnId === col.id
                      return (
                        <div
                          key={col.id}
                          className="flex items-center px-3 border-r text-sm truncate"
                          style={{ width: col.width, minWidth: col.width }}
                          data-testid={`cell-${row.id}-${col.id}`}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            startEdit(row.id, col.id, row[col.id])
                          }}
                        >
                          {isEditing ? (
                            <input
                              ref={editInputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit()
                                if (e.key === 'Escape') dispatch({ type: 'SET_EDITING', edit: null })
                              }}
                              onBlur={commitEdit}
                              className="w-full rounded border px-1.5 py-0.5 text-sm outline-none focus:border-primary"
                              data-testid={`edit-input-${row.id}-${col.id}`}
                            />
                          ) : (
                            <div className="truncate">
                              <CellContent column={col} value={row[col.id]} />
                              {row._tag && col.id === 'name' && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
                                  {row._tag}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {state.contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => dispatch({ type: 'SET_CONTEXT_MENU', menu: null })}
          />
          <div
            className="fixed z-50 w-48 rounded-md border bg-popover shadow-md py-1"
            style={{ left: state.contextMenu.x, top: state.contextMenu.y }}
            data-testid="context-menu"
          >
            <button
              onClick={() => {
                const row = state.rows.find((r) => r.id === state.contextMenu?.rowId)
                if (row) navigator.clipboard.writeText(JSON.stringify(row))
                dispatch({ type: 'SET_CONTEXT_MENU', menu: null })
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" /> Copy row
            </button>
            <button
              onClick={() => {
                startEdit(state.contextMenu!.rowId, visibleColumns[0].id, state.rows.find((r) => r.id === state.contextMenu!.rowId)?.[visibleColumns[0].id])
                dispatch({ type: 'SET_CONTEXT_MENU', menu: null })
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-accent"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                const ids = new Set([state.contextMenu!.rowId])
                dispatch({ type: 'SET_ROWS', rows: state.rows.filter((r) => !ids.has(r.id)) })
                dispatch({ type: 'SET_CONTEXT_MENU', menu: null })
              }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete row
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground" data-testid="grid-footer">
        <span>
          Showing {processedRows.length.toLocaleString()} rows
          {state.filters.length > 0 && ` (${state.filters.length} filter${state.filters.length > 1 ? 's' : ''} active)`}
        </span>
        <span>
          {state.sorts.length > 0 && `Sorted by ${state.sorts.map((s) => s.columnId).join(', ')}`}
        </span>
        <span>Double-click any cell to edit · Right-click for options · Shift+click for range select</span>
      </div>
    </div>
  )
}
