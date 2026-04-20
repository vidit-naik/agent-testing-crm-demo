'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Package, DollarSign, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { openModal, addToast, refreshKey } = useApp()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      loadProductData()
    }
  }, [productId, refreshKey])

  const loadProductData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) throw new Error('Failed to fetch product data')
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error loading product data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete product')

      addToast('Product deleted successfully', 'success')
      router.push('/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      addToast('Failed to delete product', 'error')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!product) {
    return <div className="flex items-center justify-center h-full">Product not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={product.status === 'Active' ? 'success' : 'default'}>{product.status}</Badge>
              {product.category && <span className="text-sm text-muted-foreground">{product.category}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openModal('editProduct', { product })}>Edit</Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {product.sku && (
            <div className="text-sm">
              <span className="font-medium">SKU:</span> {product.sku}
            </div>
          )}
          {product.description && (
            <div className="text-sm">
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">{product.description}</p>
            </div>
          )}
          {product.price != null && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Price:</span> ${Number(product.price).toLocaleString()}
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Status:</span> {product.status}
          </div>
          {product.category && (
            <div className="text-sm">
              <span className="font-medium">Category:</span> {product.category}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunities */}
      {product.opportunityProducts && product.opportunityProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.opportunityProducts.map((op: any) => (
                  <TableRow key={op.id}>
                    <TableCell>
                      {op.opportunity ? (
                        <Link href={`/opportunities/${op.opportunity.id}`} className="font-medium hover:text-primary">
                          {op.opportunity.name}
                        </Link>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {op.opportunity?.account ? (
                        <Link href={`/accounts/${op.opportunity.account.id}`} className="text-primary hover:underline">
                          {op.opportunity.account.name}
                        </Link>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {op.opportunity ? <Badge>{op.opportunity.stage}</Badge> : '-'}
                    </TableCell>
                    <TableCell>{op.quantity}</TableCell>
                    <TableCell>${op.total != null ? Number(op.total).toLocaleString() : '0'}</TableCell>
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
