'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Plus, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { formatDateUTC } from '@/lib/dates'
import type { Opportunity } from '@/types'

const stages = ['Prospecting', 'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

export default function OpportunitiesPage() {
  const { openModal, refreshKey } = useApp()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOpportunities()
  }, [refreshKey])

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/opportunities')
      if (!response.ok) throw new Error('Failed to fetch opportunities')
      const data = await response.json()
      setOpportunities(data || [])
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter((opp) => opp.stage === stage)
  }

  const getStageBadgeVariant = (stage: string) => {
    if (stage === 'Closed Won') return 'success'
    if (stage === 'Closed Lost') return 'error'
    if (stage === 'Negotiation' || stage === 'Proposal') return 'warning'
    return 'info'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">Track and manage your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 text-sm ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => openModal('createOpportunity')}>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageOpps = getOpportunitiesByStage(stage)
            const stageValue = stageOpps.reduce((sum, opp) => sum + (Number(opp.value) || 0), 0)

            return (
              <div key={stage} className="flex-shrink-0 w-80">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{stage}</CardTitle>
                      <Badge variant="default">{stageOpps.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ${stageValue.toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[400px]">
                    {stageOpps.map((opp) => (
                      <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <h4 className="font-medium text-sm mb-2">{opp.name}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>${opp.value != null ? Number(opp.value).toLocaleString() : '0'}</span>
                            <span>{opp.probability || 0}%</span>
                          </div>
                          {opp.closeDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Close: {formatDateUTC(opp.closeDate)}
                            </p>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="p-6">
          <div className="space-y-3">
            {opportunities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No opportunities yet</p>
            ) : (
              opportunities.map((opp) => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{opp.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {opp.owner ? `${opp.owner} · ` : ''}${opp.value != null ? Number(opp.value).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={getStageBadgeVariant(opp.stage)}>{opp.stage}</Badge>
                        {opp.closeDate && (
                          <span className="text-sm text-muted-foreground">
                            {formatDateUTC(opp.closeDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
