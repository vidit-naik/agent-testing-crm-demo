'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { formatDateUTC } from '@/lib/dates'

export default function ActivitiesPage() {
  const { openModal, refreshKey } = useApp()
  const [activities, setActivities] = useState<any[]>([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [refreshKey])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('Failed to fetch activities')
      const data = await response.json()
      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter((activity) =>
    typeFilter === 'all' || activity.type === typeFilter
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">Track all customer interactions</p>
        </div>
        <Button onClick={() => openModal('createActivity')}>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'Email', label: 'Email' },
              { value: 'Call', label: 'Call' },
              { value: 'Meeting', label: 'Meeting' },
              { value: 'Note', label: 'Note' },
            ]}
            className="w-48"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No activities found</div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge variant="info">{activity.type}</Badge>
                <div className="flex-1">
                  <Link href={`/activities/${activity.id}`} className="font-medium hover:text-primary">{activity.subject || 'No subject'}</Link>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    {activity.account && <span>{activity.account?.name}</span>}
                    {activity.contact && (
                      <span>• {activity.contact?.firstName} {activity.contact?.lastName}</span>
                    )}
                    {activity.opportunity && <span>• {activity.opportunity?.name}</span>}
                    {activity.owner && <span>• {activity.owner}</span>}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDateUTC(activity.activityDate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
