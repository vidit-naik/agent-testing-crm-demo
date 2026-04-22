export type Knobs = {
  latency: number
  failRate: number
  ecDelay: number
  cacheBust: boolean
  locale: 'en' | 'de'
  debug: boolean
  broken: boolean
}

export const DEFAULT_KNOBS: Knobs = {
  latency: 0,
  failRate: 0,
  ecDelay: 0,
  cacheBust: false,
  locale: 'de',
  debug: false,
  broken: false,
}

export function knobsFromRequest(req: Request): Knobs {
  const url = new URL(req.url)
  const q = url.searchParams
  return {
    latency: numParam(q.get('latency'), 0),
    failRate: numParam(q.get('fail'), 0),
    ecDelay: numParam(q.get('ec'), 0),
    cacheBust: q.get('cache') === 'bust',
    locale: (q.get('locale') as 'en' | 'de') || 'de',
    debug: q.get('debug') === '1',
    broken: q.get('broken') === '1',
  }
}

function numParam(v: string | null, d: number): number {
  if (v === null) return d
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

export async function applyKnobs(k: Knobs): Promise<Response | null> {
  if (k.latency > 0) {
    await new Promise((r) => setTimeout(r, k.latency))
  }
  if (k.failRate > 0 && Math.random() < k.failRate) {
    return new Response(JSON.stringify({ error: 'simulated_failure' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })
  }
  return null
}
