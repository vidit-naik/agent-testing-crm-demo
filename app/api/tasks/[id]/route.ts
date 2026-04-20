import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/validate'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const taskId = params.id

    const data: any = {}
    if (body.completed !== undefined) data.completed = body.completed
    if (body.status !== undefined) data.status = body.status
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.priority !== undefined) data.priority = body.priority
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.owner !== undefined) data.owner = body.owner || null

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data,
    })

    return NextResponse.json(task)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        account: true,
        contact: true,
        opportunity: true,
        case: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
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
    const body = await request.json()
    const taskId = params.id

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
