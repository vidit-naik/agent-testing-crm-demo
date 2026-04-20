import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
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
        opportunity: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        activityDate: 'desc',
      },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const activity = await prisma.activity.create({
      data: {
        type: body.type,
        subject: body.subject || null,
        description: body.description || null,
        accountId: body.account_id || null,
        contactId: body.contact_id || null,
        opportunityId: body.opportunity_id || null,
        owner: body.owner || null,
        activityDate: body.activity_date ? new Date(body.activity_date) : new Date(),
      },
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
