export async function POST() {
  return new Response(JSON.stringify({ error: 'gateway_timeout' }), {
    status: 504,
    headers: { 'content-type': 'application/json' },
  })
}
