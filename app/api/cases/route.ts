import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFields, handlePrismaError } from '@/lib/validate'

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      include: {
        account: {
          select: {
            name: true,
          },
        },
        contact: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(cases)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const error = requireFields(body, ['subject'])
    if (error) return NextResponse.json({ error }, { status: 400 })

    const caseItem = await prisma.case.create({
      data: {
        accountId: body.account_id || null,
        contactId: body.contact_id || null,
        subject: body.subject,
        description: body.description || null,
        status: body.status || 'New',
        priority: body.priority || 'Medium',
        category: body.category || null,
        resolution: body.resolution || null,
        satisfactionRating: body.satisfaction_rating ? parseInt(body.satisfaction_rating) : null,
        owner: body.owner || null,
      },
    })

    return NextResponse.json(caseItem)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
