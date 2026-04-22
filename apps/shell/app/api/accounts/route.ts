import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFields, handlePrismaError } from '@/lib/validate'

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        _count: {
          select: {
            contacts: true,
            opportunities: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const error = requireFields(body, ['name'])
    if (error) return NextResponse.json({ error }, { status: 400 })

    const account = await prisma.account.create({
      data: {
        name: body.name,
        industry: body.industry || null,
        companySize: body.company_size || null,
        owner: body.owner || null,
        healthStatus: body.health_status || 'Good',
        arr: body.arr != null && body.arr !== '' ? parseFloat(String(body.arr)) : null,
        website: body.website || null,
        phone: body.phone || null,
        address: body.address || null,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
