import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const opportunityProducts = await prisma.opportunityProduct.findMany({
      include: {
        opportunity: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(opportunityProducts);
  } catch (error) {
    console.error("Error fetching opportunity products:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunity products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create the opportunity product
    const opportunityProduct = await prisma.opportunityProduct.create({
      data: {
        opportunityId: body.opportunity_id,
        productId: body.product_id,
        quantity: body.quantity || 1,
        discount: body.discount || 0,
        total: body.total || null,
      },
      include: {
        product: true,
      },
    });

    // Auto-recalculate opportunity value
    await recalculateOpportunityValue(body.opportunity_id);

    return NextResponse.json(opportunityProduct);
  } catch (error) {
    console.error("Error creating opportunity product:", error);
    return NextResponse.json(
      { error: "Failed to add product to opportunity" },
      { status: 500 }
    );
  }
}

// Helper function to recalculate opportunity value from products
async function recalculateOpportunityValue(opportunityId: string) {
  try {
    const opportunityProducts = await prisma.opportunityProduct.findMany({
      where: { opportunityId },
      include: { product: true },
    });

    // If there are no products, preserve the manually-set opportunity value
    if (opportunityProducts.length === 0) {
      return;
    }

    let totalValue = 0;
    for (const op of opportunityProducts) {
      const quantity = op.quantity || 1;
      const price = op.product?.price != null ? Number(op.product.price) : 0;
      const discount = op.discount ? Number(op.discount) : 0;
      const lineTotal = quantity * price * (1 - discount / 100);
      totalValue += lineTotal;
    }

    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { value: totalValue },
    });
  } catch (error) {
    console.error("Error recalculating opportunity value:", error);
  }
}
