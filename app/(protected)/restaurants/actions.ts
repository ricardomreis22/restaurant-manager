"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getRestaurants() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    return await prisma.restaurant.findMany({
      where: {
        userId: parseInt(session.user.id),
      },
      include: {
        user: true,
        tables: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    return [];
  }
}

export async function createRestaurant(data: {
  name: string;
  address: string;
  phone: string;
  email: string;
  userId: number;
}) {
  try {
    return await prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        user: {
          connect: { id: data.userId },
        },
      },
      include: {
        user: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to create restaurant");
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
