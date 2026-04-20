import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFields, handlePrismaError } from '@/lib/validate'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    const { status, message } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const error = requireFields(body, ['name'])
    if (error) return NextResponse.json({ error }, { status: 400 })

    const product = await prisma.product.create({
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
