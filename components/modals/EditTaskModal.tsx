'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'

export function EditTaskModal() {
  const { closeModal, addToast, triggerRefresh, modalState } = useApp()
  const task = modalState.data?.task
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [cases, setCases] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Pending',
    priority: task?.priority || 'Medium',
    due_date: task?.dueDate ? task.dueDate.split('T')[0] : '',
    owner: task?.owner || '',
    account_id: task?.accountId || '',
    contact_id: task?.contactId || '',
    opportunity_id: task?.opportunityId || '',
    case_id: task?.caseId || '',
    completed: task?.completed || false,
  })

  useEffect(() => {
    loadAccounts()
    loadContacts()
    loadOpportunities()
    loadCases()
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

  const loadCases = async () => {
    try {
      const response = await fetch('/api/cases')
      const data = await response.json()
      setCases(data || [])
    } catch (error) {
      console.error('Error loading cases:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          completed: formData.status === 'Completed',
        }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      addToast('Task updated successfully', 'success')
      closeModal()
      triggerRefresh()
    } catch (error) {
      console.error('Error updating task:', error)
      addToast('Failed to update task', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={closeModal} title="Edit Task">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                { value: 'Pending', label: 'Pending' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' },
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

          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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

          <Select
            label="Case"
            value={formData.case_id}
            onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
            options={[
              { value: '', label: 'Select a case' },
              ...cases.map((c) => ({ value: c.id, label: c.subject })),
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
