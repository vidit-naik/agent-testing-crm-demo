'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Input, Textarea, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { useApp } from '@/contexts/AppContext'

export function EditProductModal() {
  const { closeModal, addToast, modalState, triggerRefresh } = useApp()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    status: 'Active',
    category: '',
  })

  useEffect(() => {
    if (modalState.data?.product) {
      const product = modalState.data.product
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price != null ? String(product.price) : '',
        status: product.status || 'Active',
        category: product.category || '',
      })
    }
  }, [modalState.data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const product = modalState.data?.product
    if (!product) return
    setLoading(true)

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update product')

      addToast('Product updated successfully', 'success')
      closeModal()
      triggerRefresh()
    } catch (error) {
      console.error('Error updating product:', error)
      addToast('Failed to update product', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!modalState.data?.product) return null

  return (
    <Modal isOpen={true} onClose={closeModal} title="Edit Product">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />

            <Input
              label="Price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: '', label: 'Select category' },
                { value: 'Software License', label: 'Software License' },
                { value: 'Services', label: 'Services' },
                { value: 'Support', label: 'Support' },
                { value: 'Add-on', label: 'Add-on' },
              ]}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
