import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/validate'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id

    // Get account
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Get contacts
    const contacts = await prisma.contact.findMany({
      where: {
        accountId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: {
        accountId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get activities
    const activities = await prisma.activity.findMany({
      where: {
        accountId,
      },
      orderBy: {
        activityDate: 'desc',
      },
    })

    return NextResponse.json({
      account,
      contacts,
      opportunities,
      activities,
    })
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
    const accountId = params.id
    const body = await request.json()

    const account = await prisma.account.update({
      where: {
        id: accountId,
      },
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id

    await prisma.account.delete({
      where: {
        id: accountId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
