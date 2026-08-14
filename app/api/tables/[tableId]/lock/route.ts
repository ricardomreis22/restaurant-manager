import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function resolveTableId(params: Promise<{ tableId: string }>) {
  const resolvedParams = await params;
  const tableId = parseInt(resolvedParams.tableId, 10);
  if (Number.isNaN(tableId) || tableId < 1) {
    return null;
  }
  return tableId;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tableId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tableId = await resolveTableId(params);
    if (tableId == null) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 },
      );
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { isLocked: true },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ isLocked: table.isLocked });
  } catch (error) {
    console.error("[TABLE_LOCK_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tableId = await resolveTableId(params);
    if (tableId == null) {
      return NextResponse.json(
        { error: "Table ID is required" },
        { status: 400 },
      );
    }

    // keepalive / empty body should still unlock
    let locked = false;
    try {
      const body = await req.json();
      if (typeof body?.locked === "boolean") {
        locked = body.locked;
      }
    } catch {
      locked = false;
    }

    const result = await prisma.table.updateMany({
      where: { id: tableId },
      data: { isLocked: locked },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TABLE_LOCK_PATCH]", error);
    const message =
      error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
