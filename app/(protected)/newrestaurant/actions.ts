"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getRestaurants() {
  try {
    return await prisma.restaurant.findMany({
      include: {
        user: true,
        tables: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch restaurants");
  }
}

export async function getRestaurant(id: number) {
  try {
    return await prisma.restaurant.findUnique({
      where: { id },
      include: {
        user: true,
        tables: true,
        employees: true,
        menus: true,
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
      throw new Error("Not authenticated");
    }

    console.log(formData);

    const restaurant = await prisma.restaurant.create({
      data: {
        name: formData.name,
        address: formData.address,
        phone: formData.phone || "",
        email: formData.email || "",
        userId: parseInt(session.user.id),
      },
    });

    return { success: true, restaurant };
  } catch (error) {
    console.error("Failed to create restaurant:", error);
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
      updateData.user = {
        connect: { id: data.userId },
      };
      delete updateData.userId;
    }

    return await prisma.restaurant.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to update restaurant");
  }
}

export async function deleteRestaurant(id: number) {
  try {
    return await prisma.restaurant.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Failed to delete restaurant");
  }
}

export async function getRestaurantsByUser(userId: number) {
  try {
    return await prisma.restaurant.findMany({
      where: {
        userId,
      },
      include: {
        tables: true,
        employees: true,
        menus: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch user's restaurants");
  }
}
