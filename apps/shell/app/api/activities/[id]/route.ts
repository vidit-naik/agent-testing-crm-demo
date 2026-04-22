import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        account: true,
        contact: true,
        opportunity: true,
      },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id
    const body = await request.json()

    const activity = await prisma.activity.update({
      where: {
        id: activityId,
      },
      data: {
        type: body.type,
        subject: body.subject || null,
        description: body.description || null,
        owner: body.owner || null,
        accountId: body.account_id || null,
        contactId: body.contact_id || null,
        opportunityId: body.opportunity_id || null,
        activityDate: body.activity_date ? new Date(body.activity_date) : undefined,
      },
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id

    await prisma.activity.delete({
      where: {
        id: activityId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
