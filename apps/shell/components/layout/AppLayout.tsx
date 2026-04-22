'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  CheckSquare,
  MessageSquare,
  LifeBuoy,
  Package,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Menu,
  FlaskConical,
} from 'lucide-react'
import { ToastContainer } from '../ui/Toast'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import { ModalManager } from '../modals/ModalManager'
import { ShadowConsent } from '../global/ShadowConsent'
import { LocaleToggle } from '../global/LocaleToggle'
import { LoginOverlay } from '../global/LoginOverlay'

type NavItem = { nameKey: string; href: string; icon: any }

const navigationItems: NavItem[] = [
  { nameKey: 'nav.dashboard', href: '/', icon: LayoutDashboard },
  { nameKey: 'nav.accounts', href: '/accounts', icon: Building2 },
  { nameKey: 'nav.contacts', href: '/contacts', icon: Users },
  { nameKey: 'nav.opportunities', href: '/opportunities', icon: TrendingUp },
  { nameKey: 'nav.tasks', href: '/tasks', icon: CheckSquare },
  { nameKey: 'nav.activities', href: '/activities', icon: MessageSquare },
  { nameKey: 'nav.cases', href: '/cases', icon: LifeBuoy },
  { nameKey: 'nav.products', href: '/products', icon: Package },
  { nameKey: 'nav.lab', href: '/lab', icon: FlaskConical },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
  { nameKey: 'nav.help', href: '/help', icon: HelpCircle },
]

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { toasts, removeToast } = useApp()
  const { t } = useLocale()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [visibleModules, setVisibleModules] = useState<Record<string, boolean> | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('crm-modules')
    if (saved) {
      try {
        setVisibleModules(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const filteredNavItems = visibleModules
    ? navigationItems.filter(
        (item) =>
          item.nameKey === 'nav.settings' ||
          item.nameKey === 'nav.help' ||
          item.nameKey === 'nav.lab' ||
          visibleModules[t(item.nameKey)] !== false
      )
    : navigationItems

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">Demo CRM</h1>
        </div>
        <nav className="space-y-1 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.nameKey}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {t(item.nameKey)}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
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
                placeholder={t('search.placeholder')}
                readOnly
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-not-allowed opacity-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LocaleToggle />
            <button className="relative rounded-full p-2 hover:bg-accent">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              JS
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ModalManager />

      <ShadowConsent
        title={t('consent.title')}
        body={t('consent.body')}
        accept={t('consent.accept')}
        reject={t('consent.reject')}
      />
      <LoginOverlay />
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AppProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </AppProvider>
    </LocaleProvider>
  )
}
