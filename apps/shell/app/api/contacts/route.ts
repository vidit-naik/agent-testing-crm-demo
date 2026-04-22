import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFields, handlePrismaError } from '@/lib/validate'

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
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

    return NextResponse.json(contacts)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const error = requireFields(body, ['first_name', 'last_name'])
    if (error) return NextResponse.json({ error }, { status: 400 })

    const contact = await prisma.contact.create({
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
