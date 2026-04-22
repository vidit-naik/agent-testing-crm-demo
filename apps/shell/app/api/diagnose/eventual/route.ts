import { ecList, ecSet } from '@crm/fake-api'

function key(name: string) {
  return `diag-ec:${name}`
}

export async function GET(req: Request) {
  const entities = ecList<{ name: string }>('diag-ec:').map((e) => e.name)
  return Response.json({ entities }, { headers: { 'cache-control': 'no-store' } })
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const broken = url.searchParams.get('broken') === '1'
  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name : `Item-${Date.now()}`
  const delay = 2500 + Math.random() * 500
  ecSet(key(name), { name }, delay, broken)
  return Response.json({ ok: true, name, delay })
}
