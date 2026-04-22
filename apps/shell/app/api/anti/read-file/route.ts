const flakes = new Map<string, number>()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || ''
  const attempts = (flakes.get(path) || 0) + 1
  flakes.set(path, attempts)

  if (attempts < 2) {
    return new Response(JSON.stringify({ error: `ENOTDIR: not a directory, read '${path}'` }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }

  return Response.json({
    path,
    snippet: `// success after retry, attempt ${attempts}\nexport function ${path.split('/').pop()?.replace('.tsx', '')}() {}`,
  })
}
