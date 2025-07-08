"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
type ActivityType =
  | "ORDER_PLACED"
  | "ORDER_MODIFIED"
  | "ORDER_CANCELLED"
  | "PAYMENT_PROCESSED"
  | "ITEM_ADDED"
  | "ITEM_REMOVED"
  | "PAYMENT_METHOD_CHANGED"
  | "DISCOUNT_APPLIED"
  | "PROMOTION_APPLIED"
  | "NOTE_ADDED"
  | "GUEST_COUNT_CHANGED";

// Create a new table session when a table is opened
export async function createTableSession(
  tableId: number,
  numberOfGuests: number
) {
  try {
    const tableSession = await prisma.tableSession.create({
      data: {
        tableId,
        numberOfGuests,
      },
    });

    return { success: true, session: tableSession };
  } catch (error) {
    console.error("[CREATE_TABLE_SESSION_ERROR]", error);
    throw error;
  }
}

// Log an activity for a table session
export async function logActivity(
  sessionId: number,
  activityType: ActivityType,
  description: string,
  metadata?: any
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const activity = await prisma.activityLog.create({
      data: {
        sessionId,
        userId: parseInt(session.user.id),
        activityType,
        description,
        metadata,
      },
    });

    return { success: true, activity };
  } catch (error) {
    console.error("[LOG_ACTIVITY_ERROR]", error);
    throw error;
  }
}

// Get all activities for a table session
export async function getSessionActivities(sessionId: number) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: {
        sessionId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    return { success: true, activities };
  } catch (error) {
    console.error("[GET_SESSION_ACTIVITIES_ERROR]", error);
    throw error;
  }
}

// Get the current active session for a table
export async function getCurrentTableSession(tableId: number) {
  try {
    const tableSession = await prisma.tableSession.findFirst({
      where: {
        tableId,
        closedAt: null, // Only active sessions
      },
      include: {
        activities: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        },
        orders: true,
      },
    });

    return { success: true, session: tableSession };
  } catch (error) {
    console.error("[GET_CURRENT_TABLE_SESSION_ERROR]", error);
    throw error;
  }
}

// Close a table session
export async function closeTableSession(sessionId: number, notes?: string) {
  try {
    const tableSession = await prisma.tableSession.update({
      where: {
        id: sessionId,
      },
      data: {
        closedAt: new Date(),
        notes,
        duration: {
          // Calculate duration in minutes
          set: Math.floor(
            (new Date().getTime() - new Date().getTime()) / (1000 * 60)
          ),
        },
      },
    });

    return { success: true, session: tableSession };
  } catch (error) {
    console.error("[CLOSE_TABLE_SESSION_ERROR]", error);
    throw error;
  }
}

// Get all sessions for a table (for history)
export async function getTableSessionHistory(tableId: number) {
  try {
    const sessions = await prisma.tableSession.findMany({
      where: {
        tableId,
      },
      include: {
        activities: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        },
        orders: true,
        openedBy: {
          select: {
            name: true,
          },
        },
        closedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    return { success: true, sessions };
  } catch (error) {
    console.error("[GET_TABLE_SESSION_HISTORY_ERROR]", error);
    throw error;
  }
}
