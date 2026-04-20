'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'

export function EditContactModal() {
  const { closeModal, addToast, modalState, triggerRefresh } = useApp()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    title: '',
    role: '',
    account_id: '',
    communication_preference: 'email',
  })

  useEffect(() => {
    loadAccounts()
    if (modalState.data?.contact) {
      const contact = modalState.data.contact
      setFormData({
        first_name: contact.firstName || '',
        last_name: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        title: contact.title || '',
        role: contact.role || '',
        account_id: contact.accountId || '',
        communication_preference: contact.communicationPreference || 'email',
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
      setAccounts([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/contacts/${modalState.data?.contact?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update contact')
      }

      addToast('Contact updated successfully', 'success')
      closeModal()
      triggerRefresh()
    } catch (error) {
      console.error('Error updating contact:', error)
      addToast(error instanceof Error ? error.message : 'Failed to update contact', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={closeModal} title="Edit Contact" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: '', label: 'Select a role' },
              { value: 'Decision Maker', label: 'Decision Maker' },
              { value: 'Influencer', label: 'Influencer' },
              { value: 'Champion', label: 'Champion' },
              { value: 'Executive Sponsor', label: 'Executive Sponsor' },
              { value: 'User', label: 'User' },
            ]}
          />

          <Select
            label="Communication Preference"
            value={formData.communication_preference}
            onChange={(e) => setFormData({ ...formData, communication_preference: e.target.value })}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'text', label: 'Text' },
            ]}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Contact'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
