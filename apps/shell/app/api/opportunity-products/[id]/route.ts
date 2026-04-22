import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const opportunityProduct = await prisma.opportunityProduct.findUnique({
      where: { id },
      include: {
        opportunity: true,
        product: true,
      },
    });

    if (!opportunityProduct) {
      return NextResponse.json(
        { error: "Opportunity product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunityProduct);
  } catch (error) {
    console.error("Error fetching opportunity product:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunity product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Get the current opportunity product to find the opportunity ID
    const currentProduct = await prisma.opportunityProduct.findUnique({
      where: { id },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: "Opportunity product not found" },
        { status: 404 }
      );
    }

    const opportunityProduct = await prisma.opportunityProduct.update({
      where: { id },
      data: {
        quantity: body.quantity !== undefined ? body.quantity : undefined,
        discount: body.discount !== undefined ? body.discount : undefined,
        total: body.total !== undefined ? body.total : undefined,
      },
      include: {
        product: true,
      },
    });

    // Auto-recalculate opportunity value
    if (currentProduct.opportunityId) {
      await recalculateOpportunityValue(currentProduct.opportunityId);
    }

    return NextResponse.json(opportunityProduct);
  } catch (error) {
    console.error("Error updating opportunity product:", error);
    return NextResponse.json(
      { error: "Failed to update opportunity product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get the opportunity ID before deleting
    const opportunityProduct = await prisma.opportunityProduct.findUnique({
      where: { id },
    });

    if (!opportunityProduct) {
      return NextResponse.json(
        { error: "Opportunity product not found" },
        { status: 404 }
      );
    }

    const opportunityId = opportunityProduct.opportunityId;

    await prisma.opportunityProduct.delete({
      where: { id },
    });

    // Auto-recalculate opportunity value, but skip if no products remain (preserve manual value)
    if (opportunityId) {
      const remainingProducts = await prisma.opportunityProduct.count({
        where: { opportunityId },
      });
      if (remainingProducts > 0) {
        await recalculateOpportunityValue(opportunityId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting opportunity product:", error);
    return NextResponse.json(
      { error: "Failed to remove product from opportunity" },
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

