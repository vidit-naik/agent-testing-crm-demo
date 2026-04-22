'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { TrendingUp, DollarSign, Calendar, Building2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatDateUTC } from '@/lib/dates'
import { useApp } from '@/contexts/AppContext'

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const opportunityId = params.id as string
  const { openModal, refreshKey } = useApp()

  const [opportunity, setOpportunity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (opportunityId) {
      loadOpportunityData()
    }
  }, [opportunityId, refreshKey])

  const loadOpportunityData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`)
      if (!response.ok) throw new Error('Failed to fetch opportunity data')
      const data = await response.json()
      setOpportunity(data)
    } catch (error) {
      console.error('Error loading opportunity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!opportunity) return
    if (!confirm(`Are you sure you want to delete ${opportunity.name}?`)) return

    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete opportunity')

      router.push('/opportunities')
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      alert('Failed to delete opportunity')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!opportunity) {
    return <div className="flex items-center justify-center h-full">Opportunity not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{opportunity.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{opportunity.stage}</Badge>
              {opportunity.account && (
                <Link href={`/accounts/${opportunity.account.id}`} className="text-sm text-muted-foreground hover:text-primary">
                  {opportunity.account.name}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal('editOpportunity', { opportunity })}>Edit</Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${opportunity.value != null ? Number(opportunity.value).toLocaleString() : '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunity.probability ?? 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Close Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {opportunity.closeDate ? formatDateUTC(opportunity.closeDate) : 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="font-medium">Stage:</span> {opportunity.stage}
          </div>
          <div className="text-sm">
            <span className="font-medium">Owner:</span> {opportunity.owner || '-'}
          </div>
          {opportunity.nextSteps && (
            <div className="text-sm">
              <span className="font-medium">Next Steps:</span> {opportunity.nextSteps}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities */}
      {opportunity.activities && opportunity.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunity.activities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <Badge variant="info">{activity.type}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.subject || 'No subject'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateUTC(activity.activityDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks */}
      {opportunity.tasks && opportunity.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunity.tasks.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link href={`/tasks/${task.id}`} className="font-medium hover:text-primary">
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell><Badge>{task.status}</Badge></TableCell>
                    <TableCell><Badge>{task.priority}</Badge></TableCell>
                    <TableCell>{task.dueDate ? formatDateUTC(task.dueDate) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Products */}
      {opportunity.opportunityProducts && opportunity.opportunityProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunity.opportunityProducts.map((op: any) => (
                  <TableRow key={op.id}>
                    <TableCell>
                      {op.product ? (
                        <Link href={`/products/${op.product.id}`} className="font-medium hover:text-primary">
                          {op.product.name}
                        </Link>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{op.quantity}</TableCell>
                    <TableCell>{op.discount}%</TableCell>
                    <TableCell>
                      ${op.product?.price != null
                        ? ((op.quantity || 1) * Number(op.product.price) * (1 - (Number(op.discount) || 0) / 100)).toLocaleString()
                        : '0'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
