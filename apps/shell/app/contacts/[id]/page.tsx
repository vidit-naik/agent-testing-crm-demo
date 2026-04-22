'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { User, Mail, Phone, Building2, Trash2, StickyNote } from 'lucide-react'
import Link from 'next/link'
import { formatDateUTC } from '@/lib/dates'
import { useApp } from '@/contexts/AppContext'
import { NotesDrawer } from '@/components/notes/NotesDrawer'

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string
  const { openModal, refreshKey } = useApp()

  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesHtml, setNotesHtml] = useState('')

  useEffect(() => {
    if (contactId) {
      loadContactData()
    }
  }, [contactId, refreshKey])

  const loadContactData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/contacts/${contactId}`)
      if (!response.ok) throw new Error('Failed to fetch contact data')
      const data = await response.json()
      setContact(data)
    } catch (error) {
      console.error('Error loading contact data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contact) return
    if (!confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete contact')

      router.push('/contacts')
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!contact) {
    return <div className="flex items-center justify-center h-full">Contact not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{contact.firstName} {contact.lastName}</h1>
            <div className="flex items-center gap-2 mt-2">
              {contact.title && <span className="text-sm text-muted-foreground">{contact.title}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNotesOpen(true)}>
            <StickyNote className="h-4 w-4 mr-2" />
            Notes
          </Button>
          <Button variant="outline" onClick={() => openModal('editContact', { contact })}>Edit</Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <NotesDrawer
        open={notesOpen}
        onOpenChange={setNotesOpen}
        title={`Notes — ${contact.firstName} ${contact.lastName}`}
        initialContent={notesHtml}
        onSave={async (html) => {
          setNotesHtml(html)
        }}
      />

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${contact.phone}`}>{contact.phone}</a>
            </div>
          )}
          {contact.account && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Link href={`/accounts/${contact.accountId}`} className="text-primary hover:underline">
                {contact.account.name}
              </Link>
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Role:</span> {contact.role || '-'}
          </div>
          <div className="text-sm">
            <span className="font-medium">Communication Preference:</span> {contact.communicationPreference ? contact.communicationPreference.charAt(0).toUpperCase() + contact.communicationPreference.slice(1) : '-'}
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      {contact.activities && contact.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contact.activities.map((activity: any) => (
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
      {contact.tasks && contact.tasks.length > 0 && (
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
                {contact.tasks.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link href={`/tasks/${task.id}`} className="font-medium hover:text-primary">
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell><Badge>{task.status}</Badge></TableCell>
                    <TableCell><Badge>{task.priority}</Badge></TableCell>
                    <TableCell>
                      {task.dueDate ? formatDateUTC(task.dueDate) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Cases */}
      {contact.cases && contact.cases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contact.cases.map((caseItem: any) => (
                  <TableRow key={caseItem.id}>
                    <TableCell>
                      <Link href={`/cases/${caseItem.id}`} className="font-medium hover:text-primary">
                        {caseItem.subject}
                      </Link>
                    </TableCell>
                    <TableCell><Badge>{caseItem.status}</Badge></TableCell>
                    <TableCell><Badge>{caseItem.priority}</Badge></TableCell>
                    <TableCell>
                      {caseItem.createdAt ? formatDateUTC(caseItem.createdAt) : '-'}
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
