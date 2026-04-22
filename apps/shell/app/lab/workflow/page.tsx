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

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Lead captured' }, position: { x: 50, y: 80 } },
  { id: '2', data: { label: 'Score lead' }, position: { x: 260, y: 80 } },
  { id: '3', data: { label: 'Route to owner' }, position: { x: 470, y: 40 } },
  { id: '4', data: { label: 'Drop to nurture' }, position: { x: 470, y: 140 } },
  { id: '5', type: 'output', data: { label: 'Create opportunity' }, position: { x: 700, y: 80 } },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3', label: 'score > 80' },
  { id: 'e2-4', source: '2', target: '4', label: 'score ≤ 80' },
  { id: 'e3-5', source: '3', target: '5' },
]

export default function WorkflowPage() {
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold">Workflow builder</h1>
        <p className="text-muted-foreground">
          xyflow pan/zoom canvas. Click coordinates are viewport-transformed.
        </p>
      </div>
      <div className="h-full rounded-lg border bg-card overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}
