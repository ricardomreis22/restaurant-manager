"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { FloorSectionId } from "@/lib/floor-sections";
import { DEFAULT_FLOOR_SECTION } from "@/lib/floor-sections";

export async function createTable(data: {
  id: number;
  number: number;
  capacity: number;
  restaurantId: number;
  area?: FloorSectionId;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.userRole !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const existingTable = await prisma.table.findFirst({
      where: {
        restaurantId: data.restaurantId,
        OR: [{ id: data.id }, { number: data.number }],
      },
    });

    if (existingTable) {
      return {
        success: false as const,
        error: "Table number already exists",
      };
    }

    const table = await prisma.table.create({
      data: {
        id: data.id,
        number: data.number,
        capacity: data.capacity,
        restaurantId: data.restaurantId,
        isReserved: false,
        // Available after running: npx prisma migrate dev
        area: data.area ?? DEFAULT_FLOOR_SECTION,
      } as Parameters<typeof prisma.table.create>[0]["data"],
    });

    return { success: true, table };
  } catch (error) {
    console.error("[CREATE_TABLE_ERROR]", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false as const,
        error: "Table number already exists",
      };
    }
    throw error;
  }
}

export async function deleteTable(tableId: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.userRole !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    await prisma.table.delete({
      where: {
        id: tableId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[DELETE_TABLE_ERROR]", error);
    throw error;
  }
}

export async function getTables(restaurantId: number) {
  try {
    const tables = await prisma.table.findMany({
      where: {
        restaurantId: restaurantId,
      },
      orderBy: {
        number: "asc",
      },
    });

    return { success: true, tables };
  } catch (error) {
    console.error("[GET_TABLES_ERROR]", error);
    throw error;
  }
}

export async function getTable(tableId: number, restaurantId: number) {
  try {
    const table = await prisma.table.findFirst({
      where: {
        id: tableId,
        restaurantId,
      },
    });

    if (!table) {
      return { success: false as const, table: null };
    }

    return { success: true as const, table };
  } catch (error) {
    console.error("[GET_TABLE_ERROR]", error);
    throw error;
  }
}

export async function toggleTableLock(tableId: number, locked: boolean) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const table = await prisma.table.update({
      where: { id: tableId },
      data: { isLocked: locked },
    });

    return table;
  } catch (error) {
    console.error("Failed to toggle table lock:", error);
    throw error;
  }
}

export async function checkTableLock(tableId: number) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });
  return table?.isLocked;
}

export async function updateTablePosition(
  tableId: number,
  x: number,
  y: number,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.userRole !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: { x, y },
    });

    return { success: true, table };
  } catch (error) {
    console.error("[UPDATE_TABLE_POSITION_ERROR]", error);
    throw error;
  }
}
