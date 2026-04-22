'use client'

import { useLocale } from '@/contexts/LocaleContext'

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale()
  return (
    <button
      onClick={() => setLocale(locale === 'de' ? 'en' : 'de')}
      className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-input bg-background hover:bg-accent transition-colors"
      aria-label="Toggle locale"
    >
      {t('locale.switch')}
    </button>
  )
}
