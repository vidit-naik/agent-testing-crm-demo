import { ecList, ecSet } from '@crm/fake-api'

const SEED = ['Software', 'Hardware', 'Services', 'Support', 'Training']

function key(name: string) {
  return `category:${name.toLowerCase().trim()}`
}

function seedOnce() {
  for (const name of SEED) {
    if (!ecList<{ name: string }>('category:').some((c) => c.name === name)) {
      ecSet(key(name), { name }, 0)
    }
  }
}

seedOnce()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const all = ecList<{ name: string }>('category:').map((c) => c.name)
  return Response.json(all, {
    headers: {
      'cache-control': url.searchParams.get('fixCache') === '1' ? 'no-store' : 'max-age=30',
    },
  })
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const broken = url.searchParams.get('broken') === '1'
  const ecDelay = Number(url.searchParams.get('ec')) || 2500
  const jitter = Math.random() * 500
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return new Response(JSON.stringify({ error: 'name required' }), { status: 400 })
  }
  ecSet(key(name), { name }, ecDelay + jitter, broken)
  return Response.json({ ok: true, name, committed: false })
}
