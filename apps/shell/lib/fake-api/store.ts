type Timer = ReturnType<typeof setTimeout>

const pending = new Map<string, Timer>()
const committed = new Map<string, unknown>()

export function ecSet(key: string, value: unknown, delayMs: number, broken = false) {
  const existing = pending.get(key)
  if (existing) clearTimeout(existing)

  if (delayMs <= 0 && !broken) {
    committed.set(key, value)
    return
  }

  if (broken) {
    pending.set(
      key,
      setTimeout(() => {
        pending.delete(key)
      }, delayMs)
    )
    return
  }

  pending.set(
    key,
    setTimeout(() => {
      committed.set(key, value)
      pending.delete(key)
    }, delayMs)
  )
}

export function ecGet<T>(key: string): T | undefined {
  return committed.get(key) as T | undefined
}

export function ecList<T>(prefix: string): T[] {
  const out: T[] = []
  committed.forEach((v, k) => {
    if (k.startsWith(prefix)) out.push(v as T)
  })
  return out
}

export function ecClear(prefix?: string) {
  if (!prefix) {
    pending.forEach((t) => clearTimeout(t))
    pending.clear()
    committed.clear()
    return
  }
  pending.forEach((t, k) => {
    if (k.startsWith(prefix)) {
      clearTimeout(t)
      pending.delete(k)
    }
  })
  committed.forEach((_, k) => {
    if (k.startsWith(prefix)) committed.delete(k)
  })
}
