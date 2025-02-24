"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

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
