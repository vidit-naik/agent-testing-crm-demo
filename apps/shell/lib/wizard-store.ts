'use client'

export function getWizard<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = sessionStorage.getItem(`wizard:${key}`)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function setWizard<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(`wizard:${key}`, JSON.stringify(value))
  } catch {}
}

export function clearWizard(key: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(`wizard:${key}`)
  } catch {}
}
