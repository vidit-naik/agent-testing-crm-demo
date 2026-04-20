import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handlePrismaError } from '@/lib/validate'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        opportunityProducts: {
          include: {
            opportunity: {
              include: {
                account: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
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
    const productId = params.id
    const body = await request.json()

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: body.name,
        sku: body.sku || null,
        description: body.description || null,
        price: body.price != null && body.price !== '' ? String(body.price) : null,
        status: body.status || 'Active',
        category: body.category || null,
      },
    })

    return NextResponse.json(product)
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
    const productId = params.id

    await prisma.product.delete({
      where: {
        id: productId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}
