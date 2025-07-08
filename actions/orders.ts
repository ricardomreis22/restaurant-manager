"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

interface OrderItem {
  menuItemId: number;
  quantity: number;
  spicyLevel?: string;
  sides?: string;
  notes?: string;
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
      // Check if there's already an active session for this table
      let tableSession = await tx.tableSession.findFirst({
        where: {
          tableId: data.tableId,
          closedAt: null, // Only active sessions
        },
      });

      // If no active session exists, create one
      if (!tableSession) {
        tableSession = await tx.tableSession.create({
          data: {
            tableId: data.tableId,
            openedAt: new Date(),
            totalAmount: 0,
            numberOfGuests: 0, // This can be updated later
          },
        });

        // Create activity log for session start
        await tx.activityLog.create({
          data: {
            sessionId: tableSession.id,
            userId: parseInt(session.user.id!),
            activityType: "ORDER_PLACED",
            description: "Table session started with first order",
            metadata: {
              orderNumber,
              totalAmount: data.totalAmount,
            },
          },
        });
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          tableId: data.tableId,
          sessionId: tableSession.id, // Link order to session
          totalAmount: data.totalAmount,
          status: "Pending",
          items: {
            create: data.items.map((item) => ({
              quantity: item.quantity,
              spicyLevel: item.spicyLevel,
              sides: item.sides,
              notes: item.notes,
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

      // Update session total amount
      await tx.tableSession.update({
        where: { id: tableSession.id },
        data: {
          totalAmount: {
            increment: data.totalAmount,
          },
        },
      });

      // Create activity log for order placement
      await tx.activityLog.create({
        data: {
          sessionId: tableSession.id,
          userId: parseInt(session.user.id!),
          activityType: "ORDER_PLACED",
          description: `Order ${orderNumber} placed`,
          metadata: {
            orderId: newOrder.id,
            orderNumber,
            totalAmount: data.totalAmount,
            itemsCount: data.items.length,
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
        status: {
          not: "Completed", // Only return non-completed orders
        },
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
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const orders = await prisma.order.findMany({
      where: {
        tableId: order.tableId,
      },
    });

    const completedOrders = orders.filter(
      (order) => order.status === "Completed"
    );

    if (completedOrders.length === orders.length) {
      if (order.tableId) {
        // Close the table session when all orders are completed
        if (order.sessionId) {
          // Get the session details to calculate proper duration
          const tableSession = await prisma.tableSession.findUnique({
            where: { id: order.sessionId },
          });

          if (tableSession) {
            // Calculate session duration
            const sessionDuration = Math.floor(
              (new Date().getTime() -
                new Date(tableSession.openedAt).getTime()) /
                (1000 * 60)
            );

            // First update the session with end timestamp and duration
            await prisma.tableSession.update({
              where: { id: order.sessionId },
              data: {
                closedAt: new Date(),
                duration: sessionDuration,
              },
            });

            // Create activity log for session closure
            await prisma.activityLog.create({
              data: {
                sessionId: order.sessionId,
                userId: parseInt(session.user.id!),
                activityType: "PAYMENT_PROCESSED",
                description: `Table ${order.tableId} session completed and cleared`,
                metadata: {
                  tableId: order.tableId,
                  totalOrders: orders.length,
                  totalAmount: orders.reduce(
                    (sum, o) => sum + o.totalAmount,
                    0
                  ),
                  sessionDuration: sessionDuration,
                  sessionOpenedAt: tableSession.openedAt,
                  sessionClosedAt: new Date(),
                },
              },
            });

            // Keep the session for activity log reference but mark it as cleared
            await prisma.tableSession.update({
              where: { id: order.sessionId },
              data: {
                notes: "Session cleared - data preserved for activity log",
              },
            });
          }
        }

        await prisma.table.update({
          where: { id: order.tableId },
          data: {
            isReserved: false,
            isLocked: false,
          },
        });
      }

      return { success: true, order };
    }
  } catch (error) {
    console.error("[PAY_ORDER_ERROR]", error);
    throw error;
  }
}
