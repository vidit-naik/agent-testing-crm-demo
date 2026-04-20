'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckSquare, Calendar, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { formatDateUTC } from '@/lib/dates'

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { refreshKey, openModal } = useApp()
  const taskId = params.id as string

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (taskId) {
      loadTaskData()
    }
  }, [taskId, refreshKey])

  const loadTaskData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) throw new Error('Failed to fetch task data')
      const data = await response.json()
      setTask(data)
    } catch (error) {
      console.error('Error loading task data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    if (!confirm(`Are you sure you want to delete ${task.title}?`)) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

      router.push('/tasks')
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!task) {
    return <div className="flex items-center justify-center h-full">Task not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{task.status}</Badge>
              <Badge variant={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'info'}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal('editTask', { task })}>Edit</Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Task Details */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.description && (
            <div className="text-sm">
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">{task.description}</p>
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Status:</span> {task.status}
          </div>
          <div className="text-sm">
            <span className="font-medium">Priority:</span> {task.priority}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Due:</span> {formatDateUTC(task.dueDate)}
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Owner:</span> {task.owner || '-'}
          </div>
          <div className="text-sm">
            <span className="font-medium">Completed:</span> {task.completed ? 'Yes' : 'No'}
          </div>
          {task.account && (
            <div className="text-sm">
              <span className="font-medium">Account:</span>{' '}
              <Link href={`/accounts/${task.account.id}`} className="text-primary hover:underline">
                {task.account.name}
              </Link>
            </div>
          )}
          {task.contact && (
            <div className="text-sm">
              <span className="font-medium">Contact:</span>{' '}
              <Link href={`/contacts/${task.contact.id}`} className="text-primary hover:underline">
                {task.contact.firstName} {task.contact.lastName}
              </Link>
            </div>
          )}
          {task.opportunity && (
            <div className="text-sm">
              <span className="font-medium">Opportunity:</span>{' '}
              <Link href={`/opportunities/${task.opportunity.id}`} className="text-primary hover:underline">
                {task.opportunity.name}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
