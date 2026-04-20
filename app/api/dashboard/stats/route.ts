import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: { stage: { notIn: ['Closed Won', 'Closed Lost'] } },
      select: {
        value: true,
        stage: true,
      },
    })

    // Get open cases (not closed)
    const cases = await prisma.case.findMany({
      where: {
        status: {
          not: 'Closed',
        },
      },
      select: {
        id: true,
      },
    })

    // Get recent activities
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
      },
      orderBy: {
        activityDate: 'desc',
      },
      take: 5,
    })

    // Calculate pipeline value
    const pipelineValue = opportunities.reduce(
      (sum, opp) => sum + (opp.value != null ? Number(opp.value) : 0),
      0
    )

    // Transform activities to match expected structure
    const transformedActivities = activities.map((activity) => ({
      ...activity,
      accounts: activity.account ? { name: activity.account.name } : null,
      contacts: activity.contact
        ? { first_name: activity.contact.firstName, last_name: activity.contact.lastName }
        : null,
    }))

    return NextResponse.json({
      stats: {
        totalOpportunities: opportunities.length,
        pipelineValue,
        openCases: cases.length,
      },
      recentActivities: transformedActivities,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
