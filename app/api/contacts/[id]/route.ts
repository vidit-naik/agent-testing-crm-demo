import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/validate'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = params.id

    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
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
        cases: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
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
    const contactId = params.id
    const body = await request.json()

    const contact = await prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email || null,
        phone: body.phone || null,
        title: body.title || null,
        role: body.role || null,
        accountId: body.account_id || null,
        communicationPreference: body.communication_preference || 'email',
      },
    })

    return NextResponse.json(contact)
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
    const contactId = params.id

    await prisma.contact.delete({
      where: {
        id: contactId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
