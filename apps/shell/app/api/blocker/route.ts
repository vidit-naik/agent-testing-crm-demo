export const runtime = 'nodejs'

type Report = {
  type: 'app-bug' | 'backend-bug' | 'eventual-consistency' | 'test-bug' | string
  page: string
  detail?: string
  at: string
}

const store: Report[] = []

export async function POST(req: Request) {
  let body: any = null
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 })
  }
  const report: Report = {
    type: body?.type || 'unknown',
    page: body?.page || '',
    detail: body?.detail,
    at: new Date().toISOString(),
  }
  store.push(report)
  if (store.length > 500) store.splice(0, store.length - 500)
  return Response.json({ ok: true, received: report })
}

export async function GET() {
  return Response.json({ reports: store.slice(-50) })
}
