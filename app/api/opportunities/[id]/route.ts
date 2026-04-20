import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/validate'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id

    const opportunity = await prisma.opportunity.findUnique({
      where: {
        id: opportunityId,
      },
      include: {
        account: true,
        activities: {
          orderBy: {
            activityDate: 'desc',
          },
        },
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        opportunityProducts: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    return NextResponse.json(opportunity)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id
    const body = await request.json()

    const opportunity = await prisma.opportunity.update({
      where: {
        id: opportunityId,
      },
      data: {
        name: body.name,
        accountId: body.account_id || null,
        stage: body.stage,
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id

    await prisma.opportunity.delete({
      where: {
        id: opportunityId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
