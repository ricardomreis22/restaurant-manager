"use server";

import prisma from "@/lib/prisma";

export async function getRestaurants() {
  try {
    return await prisma.restaurant.findMany({
      include: {
        owner: true,
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
        owner: true,
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

export async function createRestaurant(data: {
  name: string;
  address: string;
  phone: string;
  email: string;
  ownerId: number;
}) {
  try {
    return await prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        owner: {
          connect: { id: data.ownerId },
        },
      },
      include: {
        owner: true,
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
    ownerId?: number;
  }
) {
  try {
    const updateData: any = { ...data };
    if (data.ownerId) {
      updateData.owner = {
        connect: { id: data.ownerId },
      };
      delete updateData.ownerId;
    }

    return await prisma.restaurant.update({
      where: { id },
      data: updateData,
      include: {
        owner: true,
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

export async function getRestaurantsByOwner(ownerId: number) {
  try {
    return await prisma.restaurant.findMany({
      where: {
        ownerId,
      },
      include: {
        tables: true,
        employees: true,
        menus: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch owner's restaurants");
  }
}
