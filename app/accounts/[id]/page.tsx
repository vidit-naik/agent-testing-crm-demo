'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Building2, Mail, Phone, Globe, DollarSign, Users, TrendingUp, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { Account, Contact, Opportunity, Activity } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { formatDateUTC } from '@/lib/dates'

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.id as string
  const { openModal, refreshKey } = useApp()

  const [account, setAccount] = useState<Account | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (accountId) {
      loadAccountData()
    }
  }, [accountId, refreshKey])

  const loadAccountData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/accounts/${accountId}`)
      if (!response.ok) throw new Error('Failed to fetch account data')
      const data = await response.json()

      setAccount(data.account)
      setContacts(data.contacts || [])
      setOpportunities(data.opportunities || [])
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Error loading account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!account) return
    if (!confirm(`Are you sure you want to delete ${account.name}? This will also delete all associated contacts, opportunities, activities, tasks, and cases.`)) return

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete account')

      // Redirect to accounts list after deletion
      router.push('/accounts')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!account) {
    return <div className="flex items-center justify-center h-full">Account not found</div>
  }

  const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + (Number(opp.value) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={account.healthStatus === 'Excellent' ? 'success' : account.healthStatus === 'Good' ? 'info' : 'warning'}>
                {account.healthStatus}
              </Badge>
              {account.industry && <span className="text-sm text-muted-foreground">{account.industry}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal('editAccount', { account })}>Edit</Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={() => openModal('createOpportunity', { accountId })}>
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.arr != null ? '$' + Number(account.arr).toLocaleString() : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOpportunityValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {['overview', 'contacts', 'opportunities', 'activities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {account.website ? (
                  <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {account.website}
                  </a>
                ) : '-'}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {account.phone || '-'}
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{account.address || '-'}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Company Size:</span> {account.companySize || '-'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Owner:</span> {account.owner || '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities yet</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <Badge variant="info" className="mt-0.5">{activity.type}</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.subject || 'No subject'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateUTC(activity.activityDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'contacts' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <Button size="sm" onClick={() => openModal('createContact', { accountId })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No contacts yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Link href={`/contacts/${contact.id}`} className="font-medium hover:text-primary">
                          {contact.firstName} {contact.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{contact.title || '-'}</TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>{contact.phone || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'opportunities' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Opportunities</CardTitle>
            <Button size="sm" onClick={() => openModal('createOpportunity', { accountId })}>
              <Plus className="h-4 w-4 mr-2" />
              Create Opportunity
            </Button>
          </CardHeader>
          <CardContent>
            {opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No opportunities yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Close Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <Link href={`/opportunities/${opp.id}`} className="font-medium hover:text-primary">
                          {opp.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge>{opp.stage}</Badge>
                      </TableCell>
                      <TableCell>${opp.value != null ? Number(opp.value).toLocaleString() : '0'}</TableCell>
                      <TableCell>
                        {opp.closeDate ? formatDateUTC(opp.closeDate) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'activities' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <Button size="sm" onClick={() => openModal('createActivity', { accountId })}>
              <Plus className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activities yet</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Badge variant="info">{activity.type}</Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.subject || 'No subject'}</p>
                      <p className="text-sm text-muted-foreground">{activity.description || ''}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateUTC(activity.activityDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
