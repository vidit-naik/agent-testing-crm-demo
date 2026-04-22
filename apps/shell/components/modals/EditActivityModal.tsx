'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'

export function EditActivityModal() {
  const { closeModal, addToast, triggerRefresh, modalState } = useApp()
  const activity = modalState.data?.activity
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [formData, setFormData] = useState({
    type: activity?.type || 'Note',
    subject: activity?.subject || '',
    description: activity?.description || '',
    owner: activity?.owner || '',
    account_id: activity?.accountId || '',
    contact_id: activity?.contactId || '',
    opportunity_id: activity?.opportunityId || '',
    activity_date: activity?.activityDate ? new Date(activity.activityDate).toISOString().split('T')[0] : '',
  })

  useEffect(() => {
    loadAccounts()
    loadContacts()
    loadOpportunities()
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      setAccounts(data || [])
    } catch (error) {
      console.error('Error loading accounts:', error)
    }
  }

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities')
      const data = await response.json()
      setOpportunities(data || [])
    } catch (error) {
      console.error('Error loading opportunities:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activity) return
    setLoading(true)

    try {
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update activity')

      addToast('Activity updated successfully', 'success')
      closeModal()
      triggerRefresh()
    } catch (error) {
      console.error('Error updating activity:', error)
      addToast('Failed to update activity', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!activity) return null

  return (
    <Modal isOpen={true} onClose={closeModal} title="Edit Activity">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'Email', label: 'Email' },
              { value: 'Call', label: 'Call' },
              { value: 'Meeting', label: 'Meeting' },
              { value: 'Note', label: 'Note' },
            ]}
          />

          <Input
            label="Subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />

          <Select
            label="Account"
            value={formData.account_id}
            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
            options={[
              { value: '', label: 'Select an account' },
              ...accounts.map((acc) => ({ value: acc.id, label: acc.name })),
            ]}
          />

          <Select
            label="Contact"
            value={formData.contact_id}
            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
            options={[
              { value: '', label: 'Select a contact' },
              ...contacts.map((contact) => ({
                value: contact.id,
                label: `${contact.firstName} ${contact.lastName}`,
              })),
            ]}
          />

          <Select
            label="Opportunity"
            value={formData.opportunity_id}
            onChange={(e) => setFormData({ ...formData, opportunity_id: e.target.value })}
            options={[
              { value: '', label: 'Select an opportunity' },
              ...opportunities.map((opp) => ({ value: opp.id, label: opp.name })),
            ]}
          />

          <Input
            label="Owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
          />

          <Input
            label="Activity Date"
            type="date"
            value={formData.activity_date}
            onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
