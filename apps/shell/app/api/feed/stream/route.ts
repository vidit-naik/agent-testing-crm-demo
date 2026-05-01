export const runtime = 'nodejs'

const LINES = [
  'Opening activity stream',
  'Loading opportunity changes',
  'Reviewing account health signals',
  'Opportunity ACME-42 moved to Proposal',
  'Contact Bob Smith added to Globex',
  'Risk flagged on Initech renewal',
  'Note added to Umbrella expansion',
  'Summary ready',
]

export async function GET() {
  const enc = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < LINES.length; i++) {
        controller.enqueue(enc.encode(`data: ${LINES[i]}\n\n`))
        await new Promise((r) => setTimeout(r, 650))
      }
      controller.enqueue(enc.encode(`event: done\ndata: end\n\n`))
      controller.close()
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
