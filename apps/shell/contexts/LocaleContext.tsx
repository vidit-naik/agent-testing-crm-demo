'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Locale = 'de' | 'en'

type Dict = Record<string, string>

const DICTS: Record<Locale, Dict> = {
  de: {
    'nav.dashboard': 'Armaturenbrett',
    'nav.accounts': 'Konten',
    'nav.contacts': 'Kontakte',
    'nav.opportunities': 'Verkaufschancen',
    'nav.tasks': 'Aufgaben',
    'nav.activities': 'Aktivitäten',
    'nav.cases': 'Fälle',
    'nav.products': 'Produkte',
    'nav.settings': 'Einstellungen',
    'nav.help': 'Hilfe',
    'nav.lab': 'Labor',
    'action.new': 'Neu',
    'action.save': 'Speichern',
    'action.cancel': 'Abbrechen',
    'action.next': 'Weiter',
    'action.back': 'Zurück',
    'action.continue': 'Fortfahren',
    'action.create': 'Erstellen',
    'action.edit': 'Bearbeiten',
    'action.delete': 'Löschen',
    'locale.switch': 'EN',
    'search.placeholder': 'Suche Konten, Kontakte, Chancen...',
    'dashboard.welcome': 'Willkommen zurück! Hier ist Ihre Übersicht.',
    'dashboard.pipeline': 'Pipeline-Wert',
    'dashboard.opportunities': 'Offene Chancen',
    'dashboard.cases': 'Offene Fälle',
    'dashboard.recent': 'Letzte Aktivität',
    'dashboard.quick': 'Schnellaktionen',
    'login.title': 'Anmelden',
    'login.email.label': 'E-Mail-Adresse',
    'login.email.placeholder': 'name@beispiel.de',
    'login.password.label': 'Passwort',
    'login.password.placeholder': 'Passwort eingeben',
    'login.step1.subtitle': 'Geben Sie Ihre E-Mail-Adresse ein, um fortzufahren.',
    'login.step2.subtitle': 'Geben Sie das Passwort für {email} ein.',
    'consent.title': 'Cookie-Einstellungen',
    'consent.body': 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Dies ist ein Pflichtbanner vor der Interaktion.',
    'consent.accept': 'Alle akzeptieren',
    'consent.reject': 'Ablehnen',
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.accounts': 'Accounts',
    'nav.contacts': 'Contacts',
    'nav.opportunities': 'Opportunities',
    'nav.tasks': 'Tasks',
    'nav.activities': 'Activities',
    'nav.cases': 'Cases',
    'nav.products': 'Products',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.lab': 'Lab',
    'action.new': 'New',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.next': 'Next',
    'action.back': 'Back',
    'action.continue': 'Continue',
    'action.create': 'Create',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'locale.switch': 'DE',
    'search.placeholder': 'Search accounts, contacts, opportunities...',
    'dashboard.welcome': "Welcome back! Here's your overview.",
    'dashboard.pipeline': 'Pipeline Value',
    'dashboard.opportunities': 'Open Opportunities',
    'dashboard.cases': 'Open Cases',
    'dashboard.recent': 'Recent Activity',
    'dashboard.quick': 'Quick Actions',
    'login.title': 'Sign in',
    'login.email.label': 'Email address',
    'login.email.placeholder': 'name@example.com',
    'login.password.label': 'Password',
    'login.password.placeholder': 'Enter password',
    'login.step1.subtitle': 'Enter your email to continue.',
    'login.step2.subtitle': 'Enter the password for {email}.',
    'consent.title': 'Cookie preferences',
    'consent.body': 'We use cookies to improve your experience. This is a required banner before interaction.',
    'consent.accept': 'Accept all',
    'consent.reject': 'Reject',
  },
}

interface LocaleContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('crm-locale') : null
    if (saved === 'en' || saved === 'de') setLocaleState(saved)
    setReady(true)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem('crm-locale', l)
    } catch {}
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const dict = DICTS[locale]
      let v = dict[key]
      if (!v) v = DICTS.en[key] || key
      if (vars) {
        for (const [k, val] of Object.entries(vars)) {
          v = v.replace(`{${k}}`, val)
        }
      }
      return v
    },
    [locale]
  )

  if (!ready) return null

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
