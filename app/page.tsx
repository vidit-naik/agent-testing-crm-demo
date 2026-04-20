'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, DollarSign, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { formatDateUTC } from '@/lib/dates'

export default function Dashboard() {
  const { refreshKey, openModal } = useApp()
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    pipelineValue: 0,
    openCases: 0,
  })

  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [refreshKey])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()

      setStats(data.stats)
      setRecentActivities(data.recentActivities || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your overview.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openModal('createOpportunity')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.pipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOpportunities} active opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">Across all stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openCases}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest interactions across your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activities. Start by creating some activities!
              </p>
            ) : (
              recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <Badge variant="info">{activity.type}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.subject || 'No subject'}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.accounts?.name || 'No account'}
                      {activity.contacts && ` • ${activity.contacts.first_name} ${activity.contacts.last_name}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateUTC(activity.activityDate)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="w-full" onClick={() => openModal('createActivity')}>
              Log Activity
            </Button>
            <Button variant="outline" className="w-full" onClick={() => openModal('createTask')}>
              Create Task
            </Button>
            <Button variant="outline" className="w-full" onClick={() => openModal('createCase')}>
              Open Case
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
