'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import type { Account } from '@/types'

export default function AccountsPage() {
  const { openModal, refreshKey } = useApp()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
  }, [refreshKey])

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      const data = await response.json()
      setAccounts(data || [])
    } catch (error) {
      console.error('Error loading accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete all associated contacts, opportunities, activities, tasks, and cases.`)) return

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete account')

      // Reload accounts after deletion
      loadAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    }
  }

  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'success'
      case 'Good':
        return 'info'
      case 'At Risk':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <Button onClick={() => openModal('createAccount')}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No accounts found matching your search.' : 'No accounts yet. Create your first account!'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Company Size</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>ARR</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Link href={`/accounts/${account.id}`} className="font-medium hover:text-primary">
                      {account.name}
                    </Link>
                  </TableCell>
                  <TableCell>{account.industry || '-'}</TableCell>
                  <TableCell>{account.companySize || '-'}</TableCell>
                  <TableCell>{account.owner || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getHealthBadgeVariant(account.healthStatus)}>
                      {account.healthStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.arr != null ? `$${Number(account.arr).toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(account.id, account.name)}
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
