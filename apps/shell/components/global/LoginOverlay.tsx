'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'

type Step = 'email' | 'password'

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginOverlay() {
  const { t } = useLocale()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setAuthed(localStorage.getItem('crm-authed') === '1')
    } catch {
      setAuthed(false)
    }
  }, [])

  if (authed === null || authed) return null

  const emailValid = VALID_EMAIL.test(email)
  const passwordValid = password.length >= 4

  const handleContinue = () => {
    if (!emailValid) return
    setError(null)
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setStep('password')
    }, 650)
  }

  const handleSignIn = () => {
    if (!passwordValid) return
    setError(null)
    setSubmitting(true)
    setTimeout(() => {
      try {
        localStorage.setItem('crm-authed', '1')
      } catch {}
      setAuthed(true)
    }, 900)
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-sm rounded-xl bg-card border shadow-2xl p-8"
        data-step={step}
        role="dialog"
        aria-label={t('login.title')}
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">{t('login.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'email' ? t('login.step1.subtitle') : t('login.step2.subtitle', { email })}
          </p>
        </div>

        {step === 'email' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="login-email">
                {t('login.email.label')}
              </label>
              <input
                id="login-email"
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                placeholder={t('login.email.placeholder')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleContinue}
              disabled={!emailValid || submitting}
              className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {submitting ? '...' : t('action.continue')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="login-password">
                {t('login.password.label')}
              </label>
              <input
                id="login-password"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                placeholder={t('login.password.placeholder')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep('email')
                  setPassword('')
                }}
                className="flex-1 rounded-md border border-input py-2 text-sm font-medium hover:bg-accent"
              >
                {t('action.back')}
              </button>
              <button
                onClick={handleSignIn}
                disabled={!passwordValid || submitting}
                className="flex-1 rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {submitting ? '...' : t('login.title')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
