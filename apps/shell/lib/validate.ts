export function requireFields(body: any, fields: string[]): string | null {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || (typeof body[f] === 'string' && body[f].trim() === '')) {
      return `${f} is required`
    }
  }
  return null
}

export function handlePrismaError(error: unknown): { status: number; message: string } {
  if (error && typeof error === 'object' && 'code' in error) {
    const e = error as any
    if (e.code === 'P2025') return { status: 404, message: 'Record not found' }
    if (e.code === 'P2002') return { status: 409, message: `Duplicate value for: ${e.meta?.target?.join(', ')}` }
    if (e.code === 'P2003') return { status: 400, message: 'Referenced record does not exist' }
  }
  return { status: 500, message: 'Internal server error' }
}
