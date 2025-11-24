import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Mark this route as dynamic to prevent static generation during build
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { number, capacity, restaurantId } = body;

    if (!number || !capacity || !restaurantId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const table = await prisma.table.create({
      data: {
        number,
        capacity,
        isReserved: false,
        restaurantId,
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("[TABLES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
