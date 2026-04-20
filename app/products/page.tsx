'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import type { Product } from '@/types'

export default function ProductsPage() {
  const { openModal, addToast, refreshKey } = useApp()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [refreshKey])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete product')

      addToast('Product deleted successfully', 'success')
      loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      addToast('Failed to delete product', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => openModal('createProduct')}>
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No products yet. Create your first product!</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell><Link href={`/products/${product.id}`} className="font-medium hover:text-primary">{product.name}</Link></TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>{product.price != null ? '$' + Number(product.price).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'Active' ? 'success' : 'default'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
