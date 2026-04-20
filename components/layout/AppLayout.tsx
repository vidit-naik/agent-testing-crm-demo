'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  UserPlus,
  CheckSquare,
  MessageSquare,
  LifeBuoy,
  Package,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Menu,
} from 'lucide-react'
import { ToastContainer } from '../ui/Toast'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { ModalManager } from '../modals/ModalManager'

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Accounts', href: '/accounts', icon: Building2 },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Opportunities', href: '/opportunities', icon: TrendingUp },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Activities', href: '/activities', icon: MessageSquare },
  { name: 'Cases', href: '/cases', icon: LifeBuoy },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { toasts, removeToast } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [visibleModules, setVisibleModules] = useState<Record<string, boolean> | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('crm-modules')
    if (saved) {
      try { setVisibleModules(JSON.parse(saved)) } catch {}
    }
  }, [])

  const filteredNavItems = visibleModules
    ? navigationItems.filter(item => item.name === 'Settings' || item.name === 'Help' || visibleModules[item.name] !== false)
    : navigationItems

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">Demo CRM</h1>
        </div>
        <nav className="space-y-1 p-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="md:hidden p-2 hover:bg-accent rounded-md"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search accounts, contacts, opportunities..."
                readOnly
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-not-allowed opacity-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 hover:bg-accent">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              JS
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Modal Manager */}
      <ModalManager />
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AppProvider>
  )
}
