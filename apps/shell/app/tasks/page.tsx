'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, CheckCircle } from 'lucide-react'
import { Select } from '@/components/ui/Input'
import { useApp } from '@/contexts/AppContext'
import Link from 'next/link'
import { formatDateUTC } from '@/lib/dates'
import type { Task } from '@/types'

export default function TasksPage() {
  const { openModal, refreshKey } = useApp()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => {
    loadTasks()
  }, [refreshKey])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskComplete = async (task: any) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
          status: !task.completed ? 'Completed' : 'In Progress',
        }),
      })

      if (!response.ok) throw new Error('Failed to update task')
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const parseLocalDate = (dateStr: string) => {
    return new Date(dateStr.split('T')[0] + 'T00:00:00')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Apply priority filter first
  const filteredTasks = tasks.filter((task) =>
    priorityFilter === 'all' || task.priority === priorityFilter
  )

  const todayTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = parseLocalDate(task.dueDate)
    return dueDate.getTime() === today.getTime() && !task.completed
  })

  const overdueTasks = filteredTasks.filter((task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = parseLocalDate(task.dueDate)
    return dueDate < today
  })

  const upcomingTasks = filteredTasks.filter((task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = parseLocalDate(task.dueDate)
    return dueDate > today
  })

  const completedTasks = filteredTasks.filter((task) => task.completed)

  const noDueDateTasks = filteredTasks.filter((task) => !task.dueDate && !task.completed)

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error'
      case 'Medium':
        return 'warning'
      case 'Low':
        return 'info'
      default:
        return 'default'
    }
  }

  const TaskList = ({ tasks, title }: { tasks: Task[]; title: string }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant="default">{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <button
                  onClick={() => toggleTaskComplete(task)}
                  className="mt-0.5"
                >
                  <CheckCircle
                    className={`h-5 w-5 ${
                      task.completed ? 'text-primary fill-primary' : 'text-muted-foreground'
                    }`}
                  />
                </button>
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    <Link href={`/tasks/${task.id}`} className="hover:text-primary">
                      {task.title}
                    </Link>
                  </h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        Due: {formatDateUTC(task.dueDate)}
                      </span>
                    )}
                    {task.owner && (
                      <span className="text-xs text-muted-foreground">• {task.owner}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your action items</p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
            className="w-40"
          />

          <Button onClick={() => openModal('createTask')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TaskList tasks={overdueTasks} title="Overdue" />
        <TaskList tasks={todayTasks} title="Today" />
        <TaskList tasks={upcomingTasks} title="Upcoming" />
        <TaskList tasks={completedTasks} title="Completed" />
        <TaskList tasks={noDueDateTasks} title="No Due Date" />
      </div>
    </div>
  )
}
