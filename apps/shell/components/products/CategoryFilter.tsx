'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PortalSelect } from '@/components/ui/PortalSelect'
import { useApp } from '@/contexts/AppContext'

export function CategoryFilter({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const { addToast } = useApp()
  const [categories, setCategories] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const cachedRef = useRef<string>('')

  const load = useCallback(async () => {
    const fix = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fixCache') === '1'
    const url = `/api/categories${fix ? '?fixCache=1' : ''}`
    const headers: HeadersInit = fix ? { 'cache-control': 'no-store' } : {}
    const res = await fetch(url, { headers, cache: fix ? 'no-store' : 'default' })
    const data = await res.json()
    cachedRef.current = Array.isArray(data) ? data.join(',') : ''
    setCategories(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    const name = newName.trim()
    if (!name) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('failed')
      addToast(`Category "${name}" submitted`, 'info')
      setNewName('')
      setAdding(false)
      // Intentionally re-fetch immediately — cache likely stale per default knobs.
      load()
    } catch {
      addToast('Failed to add category', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-end gap-2 flex-wrap">
      <div className="w-56">
        <label className="block text-sm font-medium mb-1">Category</label>
        <PortalSelect
          value={value || '__all__'}
          onChange={(v) => onChange(v === '__all__' ? '' : v)}
          options={[{ value: '__all__', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
          placeholder="All categories"
        />
      </div>
      <Button size="sm" variant="outline" onClick={load} aria-label="Refresh categories">
        <RefreshCw className="h-4 w-4" />
      </Button>
      {adding ? (
        <div className="flex items-end gap-2">
          <div className="w-48">
            <Input
              label="New category"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Accessories"
              autoFocus
            />
          </div>
          <Button size="sm" onClick={submit} disabled={submitting || !newName.trim()}>
            {submitting ? '...' : 'Add'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setAdding(false)
              setNewName('')
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" /> New category
        </Button>
      )}
    </div>
  )
}
