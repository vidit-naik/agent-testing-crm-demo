'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  const defaultModules = { Dashboard: true, Accounts: true, Contacts: true, Opportunities: true, Tasks: true, Activities: true, Cases: true, Products: true }

  const [persona, setPersona] = useState('sales')
  const [visibleModules, setVisibleModules] = useState<Record<string, boolean>>(defaultModules)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const savedPersona = localStorage.getItem('crm-persona')
    if (savedPersona) setPersona(savedPersona)
    const savedModules = localStorage.getItem('crm-modules')
    if (savedModules) setVisibleModules(JSON.parse(savedModules))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem('crm-persona', persona)
  }, [persona, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem('crm-modules', JSON.stringify(visibleModules))
  }, [visibleModules, hydrated])

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all demo data? This will reload the seed data from the database.')) {
      // In a real implementation, this would call a function to re-run the seed script
      alert('To reset data, run the seed.sql script again in your Supabase SQL Editor.')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage demo configuration and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>
            Reset and manage your demo environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Reset Demo Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Restore the database to its original seeded state
              </p>
            </div>
            <Button variant="outline" onClick={handleResetData}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Persona View</CardTitle>
          <CardDescription>
            Choose which role perspective to view the CRM from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
              <input type="radio" name="persona" value="sales" checked={persona === 'sales'} onChange={() => setPersona('sales')} className="h-4 w-4" />
              <div>
                <div className="font-medium">Sales</div>
                <div className="text-sm text-muted-foreground">
                  Focus on accounts, opportunities, and pipeline
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
              <input type="radio" name="persona" value="marketing" checked={persona === 'marketing'} onChange={() => setPersona('marketing')} className="h-4 w-4" />
              <div>
                <div className="font-medium">Marketing</div>
                <div className="text-sm text-muted-foreground">
                  Focus on customer engagement and conversion
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
              <input type="radio" name="persona" value="support" checked={persona === 'support'} onChange={() => setPersona('support')} className="h-4 w-4" />
              <div>
                <div className="font-medium">Support</div>
                <div className="text-sm text-muted-foreground">
                  Focus on cases, tickets, and customer service
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Module Visibility</CardTitle>
          <CardDescription>
            Show or hide specific CRM modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Dashboard',
              'Accounts',
              'Contacts',
              'Opportunities',
              'Tasks',
              'Activities',
              'Cases',
              'Products',
            ].map((module) => (
              <label key={module} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={visibleModules[module]}
                  onChange={(e) => setVisibleModules({ ...visibleModules, [module]: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">{module}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
