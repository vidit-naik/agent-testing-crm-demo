'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'

export function CreateOpportunityModal() {
  const { closeModal, addToast, modalState, triggerRefresh } = useApp()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    account_id: modalState.data?.accountId || '',
    stage: 'Prospecting',
    value: '',
    probability: '20',
    close_date: '',
    next_steps: '',
    owner: '',
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    const response = await fetch('/api/accounts')
    const data = await response.json()
    setAccounts(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: formData.value ? parseFloat(formData.value) : null,
          probability: parseInt(formData.probability),
        }),
      })

      if (!response.ok) throw new Error('Failed to create opportunity')

      addToast('Opportunity created successfully', 'success')
      closeModal()
      triggerRefresh()
    } catch (error) {
      console.error('Error creating opportunity:', error)
      addToast('Failed to create opportunity', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={closeModal} title="Create New Opportunity" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Opportunity Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              options={[
                { value: 'Prospecting', label: 'Prospecting' },
                { value: 'Qualification', label: 'Qualification' },
                { value: 'Discovery', label: 'Discovery' },
                { value: 'Proposal', label: 'Proposal' },
                { value: 'Negotiation', label: 'Negotiation' },
                { value: 'Closed Won', label: 'Closed Won' },
                { value: 'Closed Lost', label: 'Closed Lost' },
              ]}
            />

            <Input
              label="Value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Probability (%)"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
            />

            <Input
              label="Close Date"
              type="date"
              value={formData.close_date}
              onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
            />
          </div>

          <Input
            label="Owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
          />

          <Input
            label="Next Steps"
            value={formData.next_steps}
            onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Opportunity'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
