import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const restaurantId = parseInt(resolvedParams.restaurantId);
    if (!restaurantId) {
      return new NextResponse("Restaurant ID is required", { status: 400 });
    }

    // Get all table sessions for this restaurant with their activities
    const sessions = await prisma.tableSession.findMany({
      where: {
        table: {
          restaurantId: restaurantId,
        },
      },
      include: {
        table: {
          select: {
            number: true,
          },
        },
        activities: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[ACTIVITY_LOG_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
