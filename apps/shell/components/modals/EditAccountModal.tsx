'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'

export function EditAccountModal() {
  const { closeModal, addToast, modalState, triggerRefresh } = useApp()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    company_size: '',
    owner: '',
    health_status: 'Good',
    arr: '',
    website: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    if (modalState.data?.account) {
      const account = modalState.data.account
      setFormData({
        name: account.name || '',
        industry: account.industry || '',
        company_size: account.companySize || '',
        owner: account.owner || '',
        health_status: account.healthStatus || 'Good',
        arr: account.arr?.toString() || '',
        website: account.website || '',
        phone: account.phone || '',
        address: account.address || '',
      })
    }
  }, [modalState.data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/accounts/${modalState.data?.account?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          arr: formData.arr ? parseFloat(formData.arr) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update account')

      addToast('Account updated successfully', 'success')
      closeModal()
      triggerRefresh()
    } catch (error) {
      console.error('Error updating account:', error)
      addToast('Failed to update account', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={closeModal} title="Edit Account" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Account Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              options={[
                { value: '', label: 'Select industry' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Manufacturing', label: 'Manufacturing' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Finance', label: 'Finance' },
                { value: 'SaaS', label: 'SaaS' },
              ]}
            />

            <Select
              label="Company Size"
              value={formData.company_size}
              onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
              options={[
                { value: '', label: 'Select size' },
                { value: 'Small', label: 'Small (1-50)' },
                { value: 'Medium', label: 'Medium (51-500)' },
                { value: 'Large', label: 'Large (501-5000)' },
                { value: 'Enterprise', label: 'Enterprise (5000+)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            />

            <Select
              label="Health Status"
              value={formData.health_status}
              onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
              options={[
                { value: 'Excellent', label: 'Excellent' },
                { value: 'Good', label: 'Good' },
                { value: 'At Risk', label: 'At Risk' },
              ]}
            />
          </div>

          <Input
            label="ARR"
            type="number"
            value={formData.arr}
            onChange={(e) => setFormData({ ...formData, arr: e.target.value })}
          />

          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Account'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
