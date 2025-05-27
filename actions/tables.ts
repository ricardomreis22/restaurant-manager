"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export async function createTable(data: {
  id: number;
  number: number;
  capacity: number;
  restaurantId: number;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (session.user.userRole !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const existingTable = await prisma.table.findUnique({
      where: { id: data.id },
    });

    if (existingTable) {
      throw new Error("Table with this ID already exists");
    }

    const table = await prisma.table.create({
      data: {
        id: data.id,
        number: data.number,
        capacity: data.capacity,
        restaurantId: data.restaurantId,
        isReserved: false,
      },
    });

    return { success: true, table };
  } catch (error) {
    console.error("[CREATE_TABLE_ERROR]", error);
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

    console.log("Table locked:", table);

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
  console.log("checkTableLock", table?.isLocked);
  return table?.isLocked;
}
