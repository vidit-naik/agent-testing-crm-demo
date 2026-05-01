'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AlertCircle, CheckCircle2, Play, Plus, Save, ShieldCheck } from 'lucide-react'

type NodeKind = 'trigger' | 'condition' | 'action' | 'delay'

type WorkflowNodeData = {
  label: string
  kind: NodeKind
  owner?: string
  sla?: string
  rule?: string
}

type WorkflowNode = Node<WorkflowNodeData>

const NODE_TYPES: Array<{ kind: NodeKind; label: string; color: string }> = [
  { kind: 'trigger', label: 'Trigger', color: '#dbeafe' },
  { kind: 'condition', label: 'Condition', color: '#fef3c7' },
  { kind: 'action', label: 'Action', color: '#dcfce7' },
  { kind: 'delay', label: 'Delay', color: '#f3e8ff' },
]

const initialNodes: WorkflowNode[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Lead captured', kind: 'trigger', owner: 'Demand gen', sla: 'Immediate' },
    position: { x: 50, y: 90 },
  },
  {
    id: '2',
    data: { label: 'Score lead', kind: 'condition', rule: 'Fit score above 80' },
    position: { x: 280, y: 90 },
  },
  {
    id: '3',
    data: { label: 'Route to owner', kind: 'action', owner: 'Sales ops', sla: '15 min' },
    position: { x: 520, y: 40 },
  },
  {
    id: '4',
    data: { label: 'Enroll nurture', kind: 'delay', sla: '2 days' },
    position: { x: 520, y: 160 },
  },
  {
    id: '5',
    type: 'output',
    data: { label: 'Create opportunity', kind: 'action', owner: 'Account executive' },
    position: { x: 780, y: 90 },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3', label: 'qualified' },
  { id: 'e2-4', source: '2', target: '4', label: 'nurture' },
  { id: 'e3-5', source: '3', target: '5' },
]

function nodeStyle(data: WorkflowNodeData, active: boolean, selected: boolean) {
  const type = NODE_TYPES.find((t) => t.kind === data.kind)
  return {
    border: selected ? '2px solid #2563eb' : active ? '2px solid #16a34a' : '1px solid #cbd5e1',
    borderRadius: 8,
    background: type?.color || '#fff',
    boxShadow: active ? '0 8px 20px rgba(22, 163, 74, 0.18)' : undefined,
    padding: 10,
    minWidth: 160,
  }
}

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedId, setSelectedId] = useState('1')
  const [activePath, setActivePath] = useState<string[]>([])
  const [status, setStatus] = useState<'draft' | 'validated' | 'published'>('draft')

  const selectedNode = nodes.find((n) => n.id === selectedId)

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, label: 'next' }, eds))
      setStatus('draft')
    },
    [setEdges]
  )

  const validation = useMemo(() => {
    const incoming = new Map<string, number>()
    const outgoing = new Map<string, number>()
    edges.forEach((edge) => {
      incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1)
      outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + 1)
    })

    const issues: string[] = []
    nodes.forEach((node) => {
      if (!node.data.label.trim()) issues.push('A step is missing a name.')
      if (node.data.kind !== 'trigger' && !incoming.get(node.id)) {
        issues.push(`${node.data.label} has no incoming path.`)
      }
      if (node.type !== 'output' && node.data.kind !== 'delay' && !outgoing.get(node.id)) {
        issues.push(`${node.data.label} has no next step.`)
      }
      if (node.data.kind === 'condition' && !node.data.rule?.trim()) {
        issues.push(`${node.data.label} needs a rule.`)
      }
    })

    const triggers = nodes.filter((node) => node.data.kind === 'trigger')
    if (triggers.length !== 1) issues.push('Workflow must have one trigger.')

    return Array.from(new Set(issues))
  }, [edges, nodes])

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        style: nodeStyle(
          node.data,
          activePath.includes(node.id),
          node.id === selectedId
        ),
      })),
    [activePath, nodes, selectedId]
  )

  const displayEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        animated: activePath.includes(edge.source) && activePath.includes(edge.target),
        style:
          activePath.includes(edge.source) && activePath.includes(edge.target)
            ? { stroke: '#16a34a', strokeWidth: 2 }
            : undefined,
      })),
    [activePath, edges]
  )

  const addNode = (kind: NodeKind) => {
    const nextId = String(Math.max(...nodes.map((node) => Number(node.id)), 0) + 1)
    const type = NODE_TYPES.find((t) => t.kind === kind)!
    const node: WorkflowNode = {
      id: nextId,
      data: { label: `New ${type.label.toLowerCase()}`, kind },
      position: { x: 180 + nodes.length * 28, y: 260 + (nodes.length % 3) * 52 },
    }
    setNodes((current) => [...current, node])
    setSelectedId(nextId)
    setStatus('draft')
  }

  const updateSelected = (patch: Partial<WorkflowNodeData>) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedId ? { ...node, data: { ...node.data, ...patch } } : node
      )
    )
    setStatus('draft')
  }

  const runSample = () => {
    const start = nodes.find((node) => node.data.kind === 'trigger')?.id
    if (!start) return
    const path = [start]
    let current = start
    for (let i = 0; i < nodes.length; i++) {
      const next = edges.find((edge) => edge.source === current)?.target
      if (!next || path.includes(next)) break
      path.push(next)
      current = next
    }
    setActivePath(path)
  }

  const validate = () => {
    if (validation.length === 0) setStatus('validated')
  }

  const publish = () => {
    if (validation.length === 0) setStatus('published')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow builder</h1>
          <p className="text-muted-foreground">Design lead routing automations for the sales team.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runSample}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <Play className="h-4 w-4" />
            Run sample
          </button>
          <button
            type="button"
            onClick={validate}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <ShieldCheck className="h-4 w-4" />
            Validate
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={validation.length > 0}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Publish
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Add step</h2>
            <div className="space-y-2">
              {NODE_TYPES.map((type) => (
                <button
                  key={type.kind}
                  type="button"
                  onClick={() => addNode(type.kind)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <span>{type.label}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Status</h2>
            <div className="text-2xl font-bold capitalize">{status}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {nodes.length} steps · {edges.length} connections
            </div>
          </section>
        </aside>

        <section className="h-[640px] overflow-hidden rounded-lg border bg-card">
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={(changes) => {
              onNodesChange(changes)
              setStatus('draft')
            }}
            onEdgesChange={(changes) => {
              onEdgesChange(changes)
              setStatus('draft')
            }}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Step details</h2>
            {selectedNode ? (
              <div className="space-y-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Name</span>
                  <input
                    value={selectedNode.data.label}
                    onChange={(e) => updateSelected({ label: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">Owner</span>
                  <input
                    value={selectedNode.data.owner || ''}
                    onChange={(e) => updateSelected({ owner: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium">SLA</span>
                  <input
                    value={selectedNode.data.sla || ''}
                    onChange={(e) => updateSelected({ sla: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                {selectedNode.data.kind === 'condition' && (
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">Rule</span>
                    <input
                      value={selectedNode.data.rule || ''}
                      onChange={(e) => updateSelected({ rule: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </label>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a step to edit it.</p>
            )}
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Validation</h2>
              {validation.length === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
            </div>
            {validation.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ready to publish.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {validation.map((issue) => (
                  <li key={issue} className="rounded-md bg-amber-50 px-3 py-2 text-amber-950">
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
