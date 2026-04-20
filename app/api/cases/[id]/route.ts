import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/validate";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    const caseData = await prisma.case.findUnique({
      where: {
        id: caseId,
      },
      include: {
        account: true,
        contact: true,
        tasks: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseData);
  } catch (error) {
    const { status, message } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;
    const body = await request.json();

    const updatedCase = await prisma.case.update({
      where: {
        id: caseId,
      },
      data: {
        subject: body.subject,
        description: body.description || null,
        status: body.status,
        priority: body.priority,
        category: body.category || null,
        resolution: body.resolution || null,
        satisfactionRating: body.satisfaction_rating != null ? parseInt(String(body.satisfaction_rating)) : null,
        owner: body.owner || null,
        accountId: body.account_id || null,
        contactId: body.contact_id || null,
      },
      include: {
        account: true,
        contact: true,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    const { status, message } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = params.id;

    await prisma.case.delete({
      where: {
        id: caseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, message } = handlePrismaError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
