'use client'

import {
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Crosshair,
  FileUp,
  Layers,
  MousePointer2,
  PackageCheck,
  Pencil,
  Ruler,
  Save,
  Search,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'

type Point = { x: number; y: number }
type Tool = 'select' | 'calibrate' | 'linear' | 'area' | 'count'
type Kind = 'linear' | 'area' | 'count'
type Status = 'Draft' | 'Needs review' | 'Approved' | 'Rejected'
type Discipline = 'Concrete' | 'Drywall' | 'Electrical' | 'Mechanical' | 'Plumbing'
type Layer = 'Level 07 - core' | 'Level 07 - tenant east' | 'Level 07 - tenant west' | 'Level 07 - ceiling'

type Measurement = {
  id: string
  name: string
  kind: Kind
  discipline: Discipline
  layer: Layer
  status: Status
  costCode: string
  waste: number
  points: Point[]
  quantity: number
  unit: 'ft' | 'sq ft' | 'ea'
  note: string
}

type PlanPreview = {
  kind: 'sample' | 'pdf' | 'image'
  imageUrl?: string
  variant: number
}

const CANVAS_WIDTH = 1040
const CANVAS_HEIGHT = 640
const DEFAULT_PIXELS_PER_FOOT = 4

const DISCIPLINES: Discipline[] = ['Concrete', 'Drywall', 'Electrical', 'Mechanical', 'Plumbing']
const LAYERS: Layer[] = [
  'Level 07 - core',
  'Level 07 - tenant east',
  'Level 07 - tenant west',
  'Level 07 - ceiling',
]
const STATUSES: Status[] = ['Draft', 'Needs review', 'Approved', 'Rejected']

const TOOL_META: Record<Tool, { label: string; icon: any }> = {
  select: { label: 'Select', icon: MousePointer2 },
  calibrate: { label: 'Calibrate', icon: Crosshair },
  linear: { label: 'Linear', icon: Ruler },
  area: { label: 'Area', icon: Layers },
  count: { label: 'Count', icon: Pencil },
}

const STATUS_CLASS: Record<Status, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  'Needs review': 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
}

const KIND_COLOR: Record<Kind, string> = {
  linear: '#2563eb',
  area: '#059669',
  count: '#dc2626',
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function polygonArea(points: Point[]) {
  if (points.length < 3) return 0
  const sum = points.reduce((acc, point, index) => {
    const next = points[(index + 1) % points.length]
    return acc + point.x * next.y - next.x * point.y
  }, 0)
  return Math.abs(sum / 2)
}

function distanceToSegment(point: Point, a: Point, b: Point) {
  const lengthSquared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
  if (lengthSquared === 0) return distance(point, a)
  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / lengthSquared)
  )
  return distance(point, { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) })
}

function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersects = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

function unitFor(kind: Kind): Measurement['unit'] {
  if (kind === 'linear') return 'ft'
  if (kind === 'area') return 'sq ft'
  return 'ea'
}

function computeQuantity(kind: Kind, points: Point[], pixelsPerFoot: number) {
  if (pixelsPerFoot <= 0) return 0
  if (kind === 'linear') return points.length >= 2 ? distance(points[0], points[1]) / pixelsPerFoot : 0
  if (kind === 'area') return polygonArea(points) / pixelsPerFoot ** 2
  return points.length
}

function formatQuantity(value: number, unit: Measurement['unit']) {
  if (!Number.isFinite(value)) return `0 ${unit}`
  const formatted = unit === 'ea' ? Math.round(value).toString() : value.toFixed(1)
  return `${formatted} ${unit}`
}

function createMeasurementId() {
  return `takeoff-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function planVariantFromName(name: string) {
  return Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 7
}

function createSeedMeasurements(): Measurement[] {
  const seed: Omit<Measurement, 'quantity' | 'unit'>[] = [
    {
      id: 'seed-wall-a',
      name: 'Corridor partition run A',
      kind: 'linear',
      discipline: 'Drywall',
      layer: 'Level 07 - core',
      status: 'Draft',
      costCode: '09-2116',
      waste: 8,
      points: [
        { x: 210, y: 164 },
        { x: 485, y: 164 },
      ],
      note: 'Track both sides at corridor.',
    },
    {
      id: 'seed-slab-east',
      name: 'Tenant east polished slab',
      kind: 'area',
      discipline: 'Concrete',
      layer: 'Level 07 - tenant east',
      status: 'Needs review',
      costCode: '03-3500',
      waste: 5,
      points: [
        { x: 560, y: 170 },
        { x: 860, y: 170 },
        { x: 860, y: 392 },
        { x: 560, y: 392 },
      ],
      note: 'Exclude elevator core.',
    },
    {
      id: 'seed-diffusers',
      name: 'Supply diffusers east pod',
      kind: 'count',
      discipline: 'Mechanical',
      layer: 'Level 07 - ceiling',
      status: 'Approved',
      costCode: '23-3713',
      waste: 0,
      points: [
        { x: 618, y: 222 },
        { x: 742, y: 222 },
        { x: 814, y: 330 },
      ],
      note: 'Coordinate with ceiling grid.',
    },
  ]

  return seed.map((measurement) => ({
    ...measurement,
    quantity: computeQuantity(measurement.kind, measurement.points, DEFAULT_PIXELS_PER_FOOT),
    unit: unitFor(measurement.kind),
  }))
}

function drawBlueprint(
  ctx: CanvasRenderingContext2D,
  planName: string,
  preview: Pick<PlanPreview, 'kind' | 'variant'>,
  image?: HTMLImageElement
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.strokeStyle = '#dbeafe'
  ctx.lineWidth = 1
  for (let x = 40; x < CANVAS_WIDTH; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, CANVAS_HEIGHT)
    ctx.stroke()
  }
  for (let y = 40; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CANVAS_WIDTH, y)
    ctx.stroke()
  }

  if (image) {
    const imageRatio = image.width / image.height
    const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT
    const width = imageRatio > canvasRatio ? CANVAS_WIDTH - 96 : (CANVAS_HEIGHT - 96) * imageRatio
    const height = imageRatio > canvasRatio ? (CANVAS_WIDTH - 96) / imageRatio : CANVAS_HEIGHT - 96
    const x = (CANVAS_WIDTH - width) / 2
    const y = (CANVAS_HEIGHT - height) / 2
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x - 16, y - 16, width + 32, height + 32)
    ctx.drawImage(image, x, y, width, height)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 3
    ctx.strokeRect(x - 16, y - 16, width + 32, height + 32)
    ctx.fillStyle = '#0f172a'
    ctx.font = '600 16px sans-serif'
    ctx.fillText('Uploaded image plan', 48, 48)
    ctx.font = '12px sans-serif'
    ctx.fillText(planName, 48, 70)
    ctx.fillText('Raster preview', 900, 602)
    return
  }

  const offset = preview.kind === 'pdf' ? preview.variant * 7 : 0

  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 5
  ctx.strokeRect(136 + offset, 112, 792 - offset * 2, 420)
  ctx.lineWidth = 3
  ctx.strokeRect(180 + offset, 152, 330 - offset, 312)
  ctx.strokeRect(540, 152 + offset, 348 - offset, 312 - offset)
  ctx.strokeRect(360 + offset, 208, 144, 132)
  ctx.strokeRect(150 + offset, 484, 738 - offset * 2, 36)

  ctx.strokeStyle = '#64748b'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 8])
  ctx.beginPath()
  ctx.moveTo(520 + offset / 2, 152)
  ctx.lineTo(520 + offset / 2, 464)
  ctx.moveTo(180 + offset, 248)
  ctx.lineTo(510, 248)
  ctx.moveTo(540, 292 + offset)
  ctx.lineTo(888 - offset, 292 + offset)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#e0f2fe'
  ctx.fillRect(382 + offset, 224, 96, 96)
  ctx.fillStyle = '#cbd5e1'
  ctx.fillRect(166 + offset, 492, 708 - offset * 2, 20)

  ctx.fillStyle = '#0f172a'
  ctx.font = '600 16px sans-serif'
  ctx.fillText(preview.kind === 'pdf' ? 'Imported PDF plan preview' : 'Level 07 plan sheet', 48, 48)
  ctx.font = '12px sans-serif'
  ctx.fillText(planName, 48, 70)
  ctx.fillText('A-207', 926, 602)
  ctx.fillText('CORE', 392, 274)
  ctx.fillText('TENANT WEST', 252, 142)
  ctx.fillText('TENANT EAST', 644, 142)
}

function strokeMeasurement(ctx: CanvasRenderingContext2D, measurement: Measurement, selected: boolean) {
  const color = KIND_COLOR[measurement.kind]
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = selected ? 6 : 4
  ctx.globalAlpha = measurement.status === 'Rejected' ? 0.42 : 1

  if (measurement.kind === 'linear') {
    const [a, b] = measurement.points
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
    ;[a, b].forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, selected ? 7 : 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  if (measurement.kind === 'area') {
    ctx.beginPath()
    measurement.points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.closePath()
    ctx.globalAlpha = selected ? 0.28 : 0.16
    ctx.fill()
    ctx.globalAlpha = measurement.status === 'Rejected' ? 0.42 : 1
    ctx.stroke()
  }

  if (measurement.kind === 'count') {
    measurement.points.forEach((point, index) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, selected ? 13 : 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = '700 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(index + 1), point.x, point.y)
      ctx.fillStyle = color
    })
  }
  ctx.restore()
}

export function BlueprintTakeoffLab() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const [planName, setPlanName] = useState('Riverside tower level 07.pdf')
  const [planPreview, setPlanPreview] = useState<PlanPreview>({ kind: 'sample', variant: 0 })
  const [uploaded, setUploaded] = useState(false)
  const [tool, setTool] = useState<Tool>('select')
  const [pixelsPerFoot, setPixelsPerFoot] = useState(DEFAULT_PIXELS_PER_FOOT)
  const [knownLength, setKnownLength] = useState('24')
  const [calibrationPoints, setCalibrationPoints] = useState<Point[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>(() => createSeedMeasurements())
  const [selectedId, setSelectedId] = useState<string>('seed-wall-a')
  const [selectedIds, setSelectedIds] = useState<string[]>(['seed-wall-a'])
  const [lineDraft, setLineDraft] = useState<{ start: Point; end: Point } | null>(null)
  const [areaDraft, setAreaDraft] = useState<Point[]>([])
  const [activeDiscipline, setActiveDiscipline] = useState<Discipline>('Drywall')
  const [activeLayer, setActiveLayer] = useState<Layer>('Level 07 - tenant east')
  const [countLabel, setCountLabel] = useState('Terminal fixture')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All')
  const [disciplineFilter, setDisciplineFilter] = useState<'All' | Discipline>('All')
  const [editor, setEditor] = useState<Measurement | null>(() => createSeedMeasurements()[0])
  const [deleted, setDeleted] = useState<Measurement | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [packageName, setPackageName] = useState('Level 07 addendum A')
  const [reviewer, setReviewer] = useState('Nina Patel')
  const [dueDate, setDueDate] = useState('2026-05-22')
  const [packageState, setPackageState] = useState<'Draft' | 'Submitted' | 'Released'>('Draft')
  const [packageMeasurementIds, setPackageMeasurementIds] = useState<string[]>([])
  const [audit, setAudit] = useState<string[]>([
    'Imported Riverside tower level 07.pdf',
    'Seeded 3 existing takeoffs from estimate history',
  ])

  const selectedMeasurement = useMemo(
    () => measurements.find((measurement) => measurement.id === selectedId) ?? null,
    [measurements, selectedId]
  )

  const filteredMeasurements = useMemo(
    () =>
      measurements.filter((measurement) => {
        const matchesQuery =
          measurement.name.toLowerCase().includes(query.toLowerCase()) ||
          measurement.costCode.toLowerCase().includes(query.toLowerCase()) ||
          measurement.note.toLowerCase().includes(query.toLowerCase())
        const matchesStatus = statusFilter === 'All' || measurement.status === statusFilter
        const matchesDiscipline =
          disciplineFilter === 'All' || measurement.discipline === disciplineFilter
        return matchesQuery && matchesStatus && matchesDiscipline
      }),
    [disciplineFilter, measurements, query, statusFilter]
  )

  const selectedMeasurements = useMemo(
    () => measurements.filter((measurement) => selectedIds.includes(measurement.id)),
    [measurements, selectedIds]
  )

  const packageIds = packageState === 'Draft' ? selectedIds : packageMeasurementIds
  const packageMeasurements = useMemo(
    () => measurements.filter((measurement) => packageIds.includes(measurement.id)),
    [measurements, packageIds]
  )

  const selectedPackageTotals = useMemo(
    () =>
      packageMeasurements.reduce(
        (acc, measurement) => {
          if (measurement.kind === 'linear') acc.linear += measurement.quantity
          if (measurement.kind === 'area') acc.area += measurement.quantity
          if (measurement.kind === 'count') acc.count += measurement.quantity
          return acc
        },
        { linear: 0, area: 0, count: 0 }
      ),
    [packageMeasurements]
  )

  const totals = useMemo(
    () =>
      measurements.reduce(
        (acc, measurement) => {
          const withWaste = measurement.quantity * (1 + measurement.waste / 100)
          if (measurement.kind === 'linear') acc.linear += withWaste
          if (measurement.kind === 'area') acc.area += withWaste
          if (measurement.kind === 'count') acc.count += withWaste
          return acc
        },
        { linear: 0, area: 0, count: 0 }
      ),
    [measurements]
  )

  useEffect(() => {
    return () => {
      if (planPreview.imageUrl) URL.revokeObjectURL(planPreview.imageUrl)
    }
  }, [planPreview.imageUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false

    const drawScene = (image?: HTMLImageElement) => {
      if (cancelled) return
      drawBlueprint(ctx, planName, planPreview, image)
      measurements.forEach((measurement) =>
        strokeMeasurement(ctx, measurement, measurement.id === selectedId)
      )

      if (calibrationPoints.length > 0) {
        ctx.save()
        ctx.strokeStyle = '#f97316'
        ctx.fillStyle = '#f97316'
        ctx.lineWidth = 4
        ctx.setLineDash([8, 6])
        ctx.beginPath()
        calibrationPoints.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        })
        ctx.stroke()
        ctx.setLineDash([])
        calibrationPoints.forEach((point) => {
          ctx.beginPath()
          ctx.arc(point.x, point.y, 7, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.restore()
      }

      if (lineDraft) {
        ctx.save()
        ctx.strokeStyle = KIND_COLOR.linear
        ctx.lineWidth = 3
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.moveTo(lineDraft.start.x, lineDraft.start.y)
        ctx.lineTo(lineDraft.end.x, lineDraft.end.y)
        ctx.stroke()
        ctx.restore()
      }

      if (areaDraft.length > 0) {
        ctx.save()
        ctx.strokeStyle = KIND_COLOR.area
        ctx.fillStyle = KIND_COLOR.area
        ctx.lineWidth = 3
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        areaDraft.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y)
          else ctx.lineTo(point.x, point.y)
        })
        ctx.stroke()
        ctx.setLineDash([])
        areaDraft.forEach((point) => {
          ctx.beginPath()
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.restore()
      }
    }

    if (planPreview.kind === 'image' && planPreview.imageUrl) {
      const image = new Image()
      image.onload = () => drawScene(image)
      image.onerror = () => drawScene()
      image.src = planPreview.imageUrl
    } else {
      drawScene()
    }

    return () => {
      cancelled = true
    }
  }, [areaDraft, calibrationPoints, lineDraft, measurements, planName, planPreview, selectedId])

  const addAudit = (message: string) => {
    setAudit((current) => [message, ...current].slice(0, 8))
  }

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2800)
  }

  const canvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    }
  }

  const createMeasurement = (kind: Kind, points: Point[], name?: string) => {
    const measurement: Measurement = {
      id: createMeasurementId(),
      name:
        name ??
        `${activeDiscipline} ${kind === 'linear' ? 'run' : kind === 'area' ? 'zone' : 'count'} ${
          measurements.length + 1
        }`,
      kind,
      discipline: activeDiscipline,
      layer: activeLayer,
      status: 'Draft',
      costCode: '',
      waste: kind === 'count' ? 0 : 5,
      points,
      quantity: computeQuantity(kind, points, pixelsPerFoot),
      unit: unitFor(kind),
      note: '',
    }
    setMeasurements((current) => [measurement, ...current])
    setSelectedId(measurement.id)
    setSelectedIds([measurement.id])
    setEditor(measurement)
    addAudit(`Created ${measurement.name}`)
    showToast(`${measurement.name} created`)
  }

  const selectMeasurementAtPoint = (point: Point) => {
    const hit = [...measurements].reverse().find((measurement) => {
      if (measurement.kind === 'linear') {
        return distanceToSegment(point, measurement.points[0], measurement.points[1]) < 12
      }
      if (measurement.kind === 'area') return pointInPolygon(point, measurement.points)
      return measurement.points.some((marker) => distance(point, marker) < 18)
    })
    if (!hit) return
    setSelectedId(hit.id)
    setSelectedIds([hit.id])
    setEditor(hit)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = canvasPoint(event)
    if (tool === 'calibrate') {
      setCalibrationPoints((current) => {
        const next = current.length >= 2 ? [point] : [...current, point]
        if (next.length === 2) showToast('Calibration span captured')
        return next
      })
      return
    }
    if (tool === 'linear') {
      event.currentTarget.setPointerCapture(event.pointerId)
      setLineDraft({ start: point, end: point })
      return
    }
    if (tool === 'area') {
      setAreaDraft((current) => [...current, point])
      return
    }
    if (tool === 'count') {
      createMeasurement('count', [point], countLabel)
      return
    }
    selectMeasurementAtPoint(point)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!lineDraft || tool !== 'linear') return
    setLineDraft({ start: lineDraft.start, end: canvasPoint(event) })
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!lineDraft || tool !== 'linear') return
    const end = canvasPoint(event)
    const start = lineDraft.start
    setLineDraft(null)
    if (distance(start, end) < 16) {
      showToast('Linear takeoff ignored')
      return
    }
    createMeasurement('linear', [start, end])
  }

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPlanName(file.name)
    if (file.type.startsWith('image/')) {
      setPlanPreview({
        kind: 'image',
        imageUrl: URL.createObjectURL(file),
        variant: planVariantFromName(file.name),
      })
    } else {
      setPlanPreview({ kind: 'pdf', variant: planVariantFromName(file.name) })
    }
    setUploaded(true)
    setPackageState('Draft')
    setPackageMeasurementIds([])
    addAudit(`Uploaded and rendered ${file.name}`)
    showToast(`${file.name} imported`)
  }

  const loadSamplePlan = () => {
    setPlanName('North hospital expansion - sheet A2.13.pdf')
    setPlanPreview({ kind: 'sample', variant: 2 })
    setUploaded(true)
    setPackageState('Draft')
    setPackageMeasurementIds([])
    addAudit('Loaded sample plan sheet A2.13')
    showToast('Sample plan loaded')
  }

  const applyCalibration = () => {
    if (calibrationPoints.length !== 2) {
      showToast('Select two calibration points')
      return
    }
    const known = Number(knownLength)
    if (!Number.isFinite(known) || known <= 0) {
      showToast('Enter a positive known length')
      return
    }
    const pixelSpan = distance(calibrationPoints[0], calibrationPoints[1])
    if (pixelSpan < 8) {
      showToast('Calibration span is too short')
      return
    }
    const nextScale = pixelSpan / known
    setPixelsPerFoot(nextScale)
    setMeasurements((current) => {
      const next = current.map((measurement) => ({
        ...measurement,
        quantity: computeQuantity(measurement.kind, measurement.points, nextScale),
      }))
      setEditor((currentEditor) =>
        currentEditor ? next.find((measurement) => measurement.id === currentEditor.id) ?? currentEditor : null
      )
      return next
    })
    setCalibrationPoints([])
    addAudit(`Calibrated sheet to ${known.toFixed(1)} ft baseline`)
    showToast('Calibration applied')
  }

  const closeArea = () => {
    if (areaDraft.length < 3) {
      showToast('Area needs at least 3 points')
      return
    }
    createMeasurement('area', areaDraft)
    setAreaDraft([])
  }

  const saveEditor = () => {
    if (!editor) return
    setMeasurements((current) =>
      current.map((measurement) => (measurement.id === editor.id ? editor : measurement))
    )
    setSelectedId(editor.id)
    addAudit(`Updated ${editor.name}`)
    showToast('Measurement saved')
  }

  const deleteSelected = () => {
    if (!selectedMeasurement) return
    setDeleted(selectedMeasurement)
    setMeasurements((current) =>
      current.filter((measurement) => measurement.id !== selectedMeasurement.id)
    )
    setSelectedId('')
    setSelectedIds((current) => current.filter((id) => id !== selectedMeasurement.id))
    setEditor(null)
    addAudit(`Deleted ${selectedMeasurement.name}`)
    showToast('Measurement deleted')
  }

  const undoDelete = () => {
    if (!deleted) return
    setMeasurements((current) => [deleted, ...current])
    setSelectedId(deleted.id)
    setSelectedIds([deleted.id])
    setEditor(deleted)
    addAudit(`Restored ${deleted.name}`)
    setDeleted(null)
  }

  const duplicateSelected = () => {
    if (!selectedMeasurement) return
    const copy: Measurement = {
      ...selectedMeasurement,
      id: createMeasurementId(),
      name: `${selectedMeasurement.name} copy`,
      status: 'Draft',
      points: selectedMeasurement.points.map((point) => ({ x: point.x + 22, y: point.y + 18 })),
    }
    setMeasurements((current) => [copy, ...current])
    setSelectedId(copy.id)
    setSelectedIds([copy.id])
    setEditor(copy)
    addAudit(`Duplicated ${selectedMeasurement.name}`)
    showToast('Measurement duplicated')
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]
    )
  }

  const submitPackage = () => {
    const submittedIds = [...selectedIds]
    const submittedMeasurements = measurements.filter((measurement) =>
      submittedIds.includes(measurement.id)
    )
    if (submittedMeasurements.length === 0) {
      showToast('Select at least one measurement')
      return
    }
    setMeasurements((current) => {
      const next = current.map((measurement) =>
        submittedIds.includes(measurement.id)
          ? { ...measurement, status: 'Needs review' as Status }
          : measurement
      )
      setEditor((currentEditor) =>
        currentEditor && submittedIds.includes(currentEditor.id)
          ? { ...currentEditor, status: 'Needs review' }
          : currentEditor
      )
      return next
    })
    setPackageMeasurementIds(submittedIds)
    setPackageState('Submitted')
    addAudit(`Submitted ${packageName} to ${reviewer}`)
    showToast('Package submitted')
  }

  const releasePackage = () => {
    const releaseIds = [...packageMeasurementIds]
    if (releaseIds.length === 0) {
      showToast('Submitted package has no measurements')
      return
    }
    setMeasurements((current) => {
      const next = current.map((measurement) =>
        releaseIds.includes(measurement.id)
          ? { ...measurement, status: 'Approved' as Status }
          : measurement
      )
      setEditor((currentEditor) =>
        currentEditor && releaseIds.includes(currentEditor.id)
          ? { ...currentEditor, status: 'Approved' }
          : currentEditor
      )
      return next
    })
    setPackageState('Released')
    addAudit(`Released ${packageName}`)
    showToast('Package released')
  }

  const updateEditor = <K extends keyof Measurement>(field: K, value: Measurement[K]) => {
    setEditor((current) => (current ? { ...current, [field]: value } : current))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Blueprint takeoff</h1>
          <p className="text-muted-foreground">
            Plan upload, canvas measurements, estimate review, and release workflow.
          </p>
        </div>
        <div className="rounded-md border bg-card px-3 py-2 text-sm">
          <span className="text-muted-foreground">Scale</span>{' '}
          <span className="font-semibold" data-testid="takeoff-scale">
            1 ft = {pixelsPerFoot.toFixed(2)} px
          </span>
        </div>
      </div>

      {toast && (
        <div
          className="fixed right-5 top-20 z-40 rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 shadow"
          role="status"
        >
          {toast}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <section className="rounded-lg border bg-card">
          <div className="border-b p-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <FileUp className="h-4 w-4" />
                Upload plan
                <input
                  className="sr-only"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleUpload}
                  data-testid="blueprint-upload"
                />
              </label>
              <button
                type="button"
                className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-accent"
                onClick={loadSamplePlan}
              >
                Use sample plan
              </button>
              <div className="min-w-0 flex-1 text-sm">
                <span className="text-muted-foreground">{uploaded ? 'Active sheet' : 'Default sheet'}:</span>{' '}
                <span className="font-medium" data-testid="active-plan-name">
                  {planName}
                </span>
              </div>
            </div>
          </div>

          <div className="border-b p-3">
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(TOOL_META) as Tool[]).map((toolName) => {
                const Icon = TOOL_META[toolName].icon
                return (
                  <button
                    key={toolName}
                    type="button"
                    aria-pressed={tool === toolName}
                    className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium ${
                      tool === toolName ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                    onClick={() => setTool(toolName)}
                  >
                    <Icon className="h-4 w-4" />
                    {TOOL_META[toolName].label}
                  </button>
                )
              })}
              <select
                value={activeDiscipline}
                onChange={(event) => setActiveDiscipline(event.target.value as Discipline)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
                aria-label="Active discipline"
              >
                {DISCIPLINES.map((discipline) => (
                  <option key={discipline}>{discipline}</option>
                ))}
              </select>
              <select
                value={activeLayer}
                onChange={(event) => setActiveLayer(event.target.value as Layer)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
                aria-label="Active layer"
              >
                {LAYERS.map((layer) => (
                  <option key={layer}>{layer}</option>
                ))}
              </select>
              <input
                value={countLabel}
                onChange={(event) => setCountLabel(event.target.value)}
                className="h-9 w-44 rounded-md border bg-background px-2 text-sm"
                aria-label="Count label"
              />
            </div>
          </div>

          <div className="overflow-auto bg-slate-100 p-3">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="block max-w-full rounded-md border bg-white shadow-sm"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => setLineDraft(null)}
              onLostPointerCapture={() => setLineDraft(null)}
              data-testid="takeoff-canvas"
              aria-label="Blueprint takeoff canvas"
              role="img"
            />
          </div>

          <div className="grid gap-3 border-t p-3 md:grid-cols-3">
            <div className="rounded-md border bg-background p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Calibration
              </div>
              <div className="mt-2 flex items-end gap-2">
                <label className="flex-1 text-sm">
                  Known length
                  <input
                    value={knownLength}
                    onChange={(event) => setKnownLength(event.target.value)}
                    className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                    inputMode="decimal"
                  />
                </label>
                <button
                  type="button"
                  className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-accent"
                  onClick={applyCalibration}
                >
                  Apply
                </button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Span points: {calibrationPoints.length}/2
              </div>
            </div>

            <div className="rounded-md border bg-background p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Area draft
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm">{areaDraft.length} points staged</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="h-8 rounded-md border px-2 text-xs hover:bg-accent"
                    onClick={() => setAreaDraft((current) => current.slice(0, -1))}
                  >
                    Undo point
                  </button>
                  <button
                    type="button"
                    className="h-8 rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground disabled:opacity-40"
                    onClick={closeArea}
                    disabled={areaDraft.length < 3}
                  >
                    Close area
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-md border bg-background p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Totals with waste
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm" data-testid="takeoff-totals">
                <div>
                  <div className="font-semibold">{totals.linear.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">ft</div>
                </div>
                <div>
                  <div className="font-semibold">{totals.area.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">sq ft</div>
                </div>
                <div>
                  <div className="font-semibold">{Math.round(totals.count)}</div>
                  <div className="text-xs text-muted-foreground">ea</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold">Measurement editor</h2>
                <p className="text-xs text-muted-foreground">Selected takeoff properties</p>
              </div>
              {selectedMeasurement && (
                <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_CLASS[selectedMeasurement.status]}`}>
                  {selectedMeasurement.status}
                </span>
              )}
            </div>

            {editor ? (
              <div className="mt-4 space-y-3">
                <label className="block text-sm">
                  Measurement name
                  <input
                    value={editor.name}
                    onChange={(event) => updateEditor('name', event.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm">
                    Discipline
                    <select
                      value={editor.discipline}
                      onChange={(event) => updateEditor('discipline', event.target.value as Discipline)}
                      className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
                    >
                      {DISCIPLINES.map((discipline) => (
                        <option key={discipline}>{discipline}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    Status
                    <select
                      value={editor.status}
                      onChange={(event) => updateEditor('status', event.target.value as Status)}
                      className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
                    >
                      {STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-sm">
                  Layer
                  <select
                    value={editor.layer}
                    onChange={(event) => updateEditor('layer', event.target.value as Layer)}
                    className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
                  >
                    {LAYERS.map((layer) => (
                      <option key={layer}>{layer}</option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm">
                    Cost code
                    <input
                      value={editor.costCode}
                      onChange={(event) => updateEditor('costCode', event.target.value)}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    Waste %
                    <input
                      value={editor.waste}
                      onChange={(event) => updateEditor('waste', Number(event.target.value))}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                      type="number"
                      min={0}
                      max={40}
                    />
                  </label>
                </div>
                <label className="block text-sm">
                  Note
                  <textarea
                    value={editor.note}
                    onChange={(event) => updateEditor('note', event.target.value)}
                    className="mt-1 min-h-[72px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="rounded-md bg-muted p-3 text-sm" data-testid="selected-quantity">
                  Quantity: {formatQuantity(editor.quantity, editor.unit)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                    onClick={saveEditor}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent"
                    onClick={duplicateSelected}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="col-span-2 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-destructive px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
                    onClick={deleteSelected}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete measurement
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No measurement selected.
              </div>
            )}
          </section>

          {deleted && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div className="flex-1 text-sm">
                  <div className="font-medium">{deleted.name} deleted</div>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-2 rounded-md border border-amber-300 px-2 py-1 text-xs font-medium hover:bg-amber-100"
                    onClick={undoDelete}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Undo delete
                  </button>
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_380px]">
        <section className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                placeholder="Search measurements"
                aria-label="Search measurements"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'All' | Status)}
              className="h-9 rounded-md border bg-background px-2 text-sm"
              aria-label="Filter by status"
            >
              <option>All</option>
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <select
              value={disciplineFilter}
              onChange={(event) => setDisciplineFilter(event.target.value as 'All' | Discipline)}
              className="h-9 rounded-md border bg-background px-2 text-sm"
              aria-label="Filter by discipline"
            >
              <option>All</option>
              {DISCIPLINES.map((discipline) => (
                <option key={discipline}>{discipline}</option>
              ))}
            </select>
          </div>

          <div className="overflow-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Measurement
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Layer
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Waste
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMeasurements.map((measurement) => (
                  <tr
                    key={measurement.id}
                    className={measurement.id === selectedId ? 'bg-sky-50' : 'hover:bg-muted/30'}
                    data-testid={`measurement-row-${measurement.id}`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(measurement.id)}
                        onChange={() => toggleSelected(measurement.id)}
                        aria-label={`Select ${measurement.name}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => {
                          setSelectedId(measurement.id)
                          setSelectedIds([measurement.id])
                          setEditor(measurement)
                        }}
                      >
                        <span className="block font-medium">{measurement.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {measurement.discipline} - {measurement.costCode || 'No cost code'}
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{measurement.layer}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_CLASS[measurement.status]}`}>
                        {measurement.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatQuantity(measurement.quantity, measurement.unit)}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{measurement.waste}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-3">
          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Estimate package</h2>
                <p className="text-xs text-muted-foreground">
                  {packageMeasurements.length}{' '}
                  {packageState === 'Draft' ? 'measurements selected' : 'measurements in package'}
                </p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  packageState === 'Released'
                    ? STATUS_CLASS.Approved
                    : packageState === 'Submitted'
                    ? STATUS_CLASS['Needs review']
                    : STATUS_CLASS.Draft
                }`}
                data-testid="package-state"
              >
                {packageState}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                Package name
                <input
                  value={packageName}
                  onChange={(event) => setPackageName(event.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">
                  Reviewer
                  <select
                    value={reviewer}
                    onChange={(event) => setReviewer(event.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
                  >
                    <option>Nina Patel</option>
                    <option>Owen Brooks</option>
                    <option>Mae Carter</option>
                  </select>
                </label>
                <label className="block text-sm">
                  Due date
                  <input
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    type="date"
                  />
                </label>
              </div>
              <div className="rounded-md bg-muted p-3 text-sm" data-testid="package-summary">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Linear</span>
                  <span className="font-medium">{selectedPackageTotals.linear.toFixed(1)} ft</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Area</span>
                  <span className="font-medium">{selectedPackageTotals.area.toFixed(1)} sq ft</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Count</span>
                  <span className="font-medium">{Math.round(selectedPackageTotals.count)} ea</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Due</span>
                  <span className="font-medium">{dueDate}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
                  onClick={submitPackage}
                  disabled={selectedMeasurements.length === 0 || packageState !== 'Draft'}
                >
                  <PackageCheck className="h-4 w-4" />
                  Submit
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-accent disabled:opacity-40"
                  onClick={releasePackage}
                  disabled={packageState !== 'Submitted' || packageMeasurementIds.length === 0}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Release
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold">Audit trail</h2>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                onClick={() => setAudit([])}
                aria-label="Clear audit trail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-2" data-testid="takeoff-audit">
              {audit.map((entry, index) => (
                <li key={`${entry}-${index}`} className="rounded-md border bg-background px-3 py-2 text-sm">
                  {entry}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}
