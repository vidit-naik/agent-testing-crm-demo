'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Plus, Search, Mail, Phone, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import type { Contact } from '@/types'

export default function ContactsPage() {
  const { openModal, refreshKey } = useApp()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [refreshKey])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contacts')
      if (!response.ok) throw new Error('Failed to fetch contacts')
      const data = await response.json()
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete contact')

      loadContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your contact relationships</p>
        </div>
        <Button onClick={() => openModal('createContact')}>
          <Plus className="h-4 w-4 mr-2" />
          New Contact
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No contacts found matching your search.' : 'No contacts yet. Create your first contact!'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact: any) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link href={`/contacts/${contact.id}`} className="font-medium hover:text-primary">
                      {contact.firstName} {contact.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{contact.title || '-'}</TableCell>
                  <TableCell>
                    {contact.account?.name ? (
                      <Link href={`/accounts/${contact.accountId}`} className="text-primary hover:underline">
                        {contact.account.name}
                      </Link>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-primary hover:underline">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{contact.role || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contact.id, `${contact.firstName} ${contact.lastName}`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
