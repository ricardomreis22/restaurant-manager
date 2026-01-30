"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getRestaurants() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Not authenticated");
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
    throw error;
  }
}

export async function getRestaurant(id: number) {
  console.log("getRestaurant", id);
  try {
    return await prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: true,
        tables: true,
        menuItems: true,
        inventory: true,
        promotions: true,
        reviews: true,
        events: true,
        suppliers: true,
        reports: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch restaurant");
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
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
  });
  try {
    return await prisma.restaurant.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Failed to delete restaurant");
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
      include: {
        reservations: true,
      },
    });
    return tables;
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return [];
  }
}
