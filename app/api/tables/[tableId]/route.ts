import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tableId = parseInt(params.tableId);
    if (!tableId) {
      return new NextResponse("Table ID is required", { status: 400 });
    }

    await prisma.table.delete({
      where: {
        id: tableId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TABLE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
