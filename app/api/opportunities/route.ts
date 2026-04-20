import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFields, handlePrismaError } from '@/lib/validate'

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        account: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(opportunities)
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

    const opportunity = await prisma.opportunity.create({
      data: {
        name: body.name,
        accountId: body.account_id || null,
        stage: body.stage || 'Prospecting',
        value: body.value != null && body.value !== '' ? parseFloat(String(body.value)) : null,
        probability: body.probability ? parseInt(body.probability) : 0,
        closeDate: body.close_date ? new Date(body.close_date) : null,
        nextSteps: body.next_steps || null,
        owner: body.owner || null,
      },
    })

    return NextResponse.json(opportunity)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
