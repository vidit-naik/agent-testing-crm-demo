import { knobsFromRequest, applyKnobs } from './knobs'

export function fakeHandler<T>(fn: (req: Request, knobs: ReturnType<typeof knobsFromRequest>) => Promise<T> | T) {
  return async (req: Request): Promise<Response> => {
    const knobs = knobsFromRequest(req)
    const failure = await applyKnobs(knobs)
    if (failure) return failure

    try {
      const body = await fn(req, knobs)
      return new Response(JSON.stringify(body ?? null), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': knobs.cacheBust ? 'no-store' : 'max-age=60',
        },
      })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message || 'error' }), {
        status: err?.status || 500,
        headers: { 'content-type': 'application/json' },
      })
    }
  }
}
