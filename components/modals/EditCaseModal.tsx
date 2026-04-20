'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'

export function EditCaseModal() {
  const { closeModal, addToast, modalState, triggerRefresh } = useApp()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    category: '',
    resolution: '',
    satisfaction_rating: '',
    owner: '',
    account_id: '',
    contact_id: '',
  })

  useEffect(() => {
    loadAccounts()
    loadContacts()

    if (modalState.data?.case) {
      const caseData = modalState.data.case
      setFormData({
        subject: caseData.subject || '',
        description: caseData.description || '',
        status: caseData.status || 'New',
        priority: caseData.priority || 'Medium',
        category: caseData.category || '',
        resolution: caseData.resolution || '',
        satisfaction_rating: caseData.satisfactionRating?.toString() || '',
        owner: caseData.owner || '',
        account_id: caseData.accountId || '',
        contact_id: caseData.contactId || '',
      })
    }
  }, [modalState.data])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        satisfaction_rating: formData.satisfaction_rating ? parseInt(formData.satisfaction_rating) : null,
      }

      const response = await fetch(`/api/cases/${modalState.data?.case?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to update case')

      addToast('Case updated successfully', 'success')
      closeModal()
      triggerRefresh()
    } catch (error) {
      console.error('Error updating case:', error)
      addToast('Failed to update case', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={closeModal} title="Edit Case" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
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
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'New', label: 'New' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Waiting', label: 'Waiting' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
              ]}
            />
          </div>

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: '', label: 'Select category' },
              { value: 'Technical', label: 'Technical' },
              { value: 'Feature Request', label: 'Feature Request' },
              { value: 'Question', label: 'Question' },
              { value: 'Billing', label: 'Billing' },
            ]}
          />

          <Textarea
            label="Resolution"
            value={formData.resolution}
            onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
            rows={3}
            placeholder="Enter resolution details when case is resolved..."
          />

          <Select
            label="Satisfaction Rating"
            value={formData.satisfaction_rating}
            onChange={(e) => setFormData({ ...formData, satisfaction_rating: e.target.value })}
            options={[
              { value: '', label: 'No rating' },
              { value: '1', label: '1 - Very Unsatisfied' },
              { value: '2', label: '2 - Unsatisfied' },
              { value: '3', label: '3 - Neutral' },
              { value: '4', label: '4 - Satisfied' },
              { value: '5', label: '5 - Very Satisfied' },
            ]}
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

          <Input
            label="Owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Case'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

