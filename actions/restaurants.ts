"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DEFAULT_FLOOR_SECTION } from "@/lib/floor-sections";

export async function getRestaurants() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const restaurants = await prisma.user.findUnique({
      where: {
        id: parseInt(session.user.id),
      },
      include: {
        restaurants: true,
      },
    });

    return restaurants;
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    return null;
  }
}

export async function getRestaurant(id: number) {
  try {
    // Keep this lean — heavy includes caused production server-action failures
    // when opening a restaurant (digested RSC errors / endless Loading).
    return await prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch restaurant:", error);
    return null;
  }
}

export async function createRestaurant(formData: {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    // Check for existing restaurant with non-null values only
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { address: formData.address },
          formData.phone ? { phone: formData.phone } : {},
          formData.email ? { email: formData.email } : {},
        ],
      },
    });

    if (existingRestaurant) {
      if (existingRestaurant.address === formData.address) {
        return { error: "A restaurant at this address already exists" };
      }
      if (formData.phone && existingRestaurant.phone === formData.phone) {
        return { error: "This phone number is already registered" };
      }
      if (formData.email && existingRestaurant.email === formData.email) {
        return { error: "This email is already registered" };
      }
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: formData.name,
        address: formData.address,
        phone: formData.phone || null,
        email: formData.email || null,
        users: {
          connect: {
            id: parseInt(session.user.id),
          },
        },
        tables: {
          create: Array.from({ length: 10 }, (_, index) => ({
            number: index + 1,
            capacity: index < 5 ? 2 : 4,
            isReserved: false,
            area: DEFAULT_FLOOR_SECTION,
            x: (index % 5) * 2,
            y: Math.floor(index / 5) * 2,
          })),
        },
      },
      include: {
        users: true,
        tables: true,
        categories: true,
      },
    });

    return { success: true, restaurant };
  } catch (error) {
    return { error: "Failed to create restaurant" };
  }
}

export async function updateRestaurant(
  id: number,
  data: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    userId?: number;
  }
) {
  try {
    const updateData: any = { ...data };
    if (data.userId) {
      updateData.users = {
        connect: { id: data.userId },
      };
      delete updateData.userId;
    }

    return await prisma.restaurant.update({
      where: { id },
      data: updateData,
      include: {
        users: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to update restaurant");
  }
}

export async function deleteRestaurant(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, error: "Not authenticated" };
    }

    await prisma.restaurant.delete({
      where: { id },
    });
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete restaurant:", error);
    return { success: false as const, error: "Failed to delete restaurant" };
  }
}

export async function createInitialTables(restaurantId: number) {
  try {
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const table = await prisma.table.create({
        data: {
          number: i,
          capacity: i <= 5 ? 2 : 4, // Tables 1-5 have capacity 2, 6-10 have capacity 4
          isReserved: false,
          restaurantId: restaurantId,
        },
      });
      tables.push(table);
    }
    return tables;
  } catch (error) {
    console.error("Failed to create tables:", error);
    throw error;
  }
}

/////////////////////////////////tables
export async function getRestaurantTables(restaurantId: number) {
  try {
    const tables = await prisma.table.findMany({
      where: {
        restaurantId: restaurantId,
      },
      orderBy: {
        number: "asc",
      },
    });
    return tables;
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    // Fallback without area/reservations if schema drift breaks the full model
    try {
      const tables = await prisma.table.findMany({
        where: { restaurantId },
        orderBy: { number: "asc" },
        select: {
          id: true,
          number: true,
          capacity: true,
          isReserved: true,
          isLocked: true,
          x: true,
          y: true,
          restaurantId: true,
        },
      });
      return tables.map((table) => ({
        ...table,
        area: DEFAULT_FLOOR_SECTION as never,
      }));
    } catch (fallbackError) {
      console.error("Failed to fetch tables (fallback):", fallbackError);
      return [];
    }
  }
}
