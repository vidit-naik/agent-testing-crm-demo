'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MessageSquare, Calendar, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { formatDateUTC } from '@/lib/dates'

export default function ActivityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const activityId = params.id as string
  const { openModal, refreshKey } = useApp()

  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activityId) {
      loadActivityData()
    }
  }, [activityId, refreshKey])

  const loadActivityData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/activities/${activityId}`)
      if (!response.ok) throw new Error('Failed to fetch activity data')
      const data = await response.json()
      setActivity(data)
    } catch (error) {
      console.error('Error loading activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!activity) return
    if (!confirm(`Are you sure you want to delete this activity?`)) return

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete activity')

      router.push('/activities')
    } catch (error) {
      console.error('Error deleting activity:', error)
      alert('Failed to delete activity')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!activity) {
    return <div className="flex items-center justify-center h-full">Activity not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{activity.subject || 'Activity'}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="info">{activity.type}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal('editActivity', { activity })}>Edit</Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="font-medium">Type:</span> {activity.type}
          </div>
          {activity.subject && (
            <div className="text-sm">
              <span className="font-medium">Subject:</span> {activity.subject}
            </div>
          )}
          {activity.description && (
            <div className="text-sm">
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">{activity.description}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Date:</span> {formatDateUTC(activity.activityDate)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Owner:</span> {activity.owner || '-'}
          </div>
          {activity.account && (
            <div className="text-sm">
              <span className="font-medium">Account:</span>{' '}
              <Link href={`/accounts/${activity.account.id}`} className="text-primary hover:underline">
                {activity.account.name}
              </Link>
            </div>
          )}
          {activity.contact && (
            <div className="text-sm">
              <span className="font-medium">Contact:</span>{' '}
              <Link href={`/contacts/${activity.contact.id}`} className="text-primary hover:underline">
                {activity.contact.firstName} {activity.contact.lastName}
              </Link>
            </div>
          )}
          {activity.opportunity && (
            <div className="text-sm">
              <span className="font-medium">Opportunity:</span>{' '}
              <Link href={`/opportunities/${activity.opportunity.id}`} className="text-primary hover:underline">
                {activity.opportunity.name}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
