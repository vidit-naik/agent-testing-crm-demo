import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFields, handlePrismaError } from '@/lib/validate'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
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
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const error = requireFields(body, ['title'])
    if (error) return NextResponse.json({ error }, { status: 400 })

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'Pending',
        priority: body.priority || 'Medium',
        dueDate: body.due_date ? new Date(body.due_date) : null,
        accountId: body.account_id || null,
        contactId: body.contact_id || null,
        opportunityId: body.opportunity_id || null,
        caseId: body.case_id || null,
        owner: body.owner || null,
        completed: body.completed ?? false,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
