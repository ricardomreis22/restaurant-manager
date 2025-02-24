"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

interface OrderItem {
  menuItemId: number;
  quantity: number;
}

export async function createOrder(data: {
  tableId: number;
  items: OrderItem[];
  totalAmount: number;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Generate a unique order number (you can customize this format)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order and its items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          tableId: data.tableId,
          totalAmount: data.totalAmount,
          status: "Pending",
          items: {
            create: data.items.map((item) => ({
              quantity: item.quantity,
              menuItem: {
                connect: { id: item.menuItemId },
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });

      // Update table status if needed
      await tx.table.update({
        where: { id: data.tableId },
        data: { isReserved: true },
      });

      return newOrder;
    });

    return { success: true, order };
  } catch (error) {
    console.error("[CREATE_ORDER_ERROR]", error);
    throw error;
  }
}

export async function getTableOrders(tableId: number) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        tableId: tableId,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, orders };
  } catch (error) {
    console.error("[GET_TABLE_ORDERS_ERROR]", error);
    throw error;
  }
}

export async function payOrder(orderId: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "Completed",
        paidAt: new Date(),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // If this was the last active order for the table, update table status
    const activeOrders = await prisma.order.count({
      where: {
        tableId: order.tableId,
        status: "Pending",
      },
    });

    if (activeOrders === 0) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { isReserved: false },
      });
    }

    return { success: true, order };
  } catch (error) {
    console.error("[PAY_ORDER_ERROR]", error);
    throw error;
  }
}
