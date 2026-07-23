import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const tableId = parseInt(resolvedParams.tableId, 10);
    if (!tableId) {
      return new NextResponse("Table ID is required", { status: 400 });
    }

    const body = await req.json();
    const locked = Boolean(body?.locked);

    await prisma.table.update({
      where: { id: tableId },
      data: { isLocked: locked },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TABLE_LOCK_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
