"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function getRestaurants() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(session.user.id),
      },
      include: {
        restaurants: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    throw error;
  }
}

export async function getRestaurant(id: number) {
  try {
    return await prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: true,
        tables: true,
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

    const restaurant = await prisma.restaurant.create({
      data: {
        name: formData.name,
        address: formData.address,
        phone: formData.phone || "",
        email: formData.email || "",
        users: {
          connect: { id: parseInt(session.user.id) },
        },
        tables: {
          create: Array.from({ length: 10 }, (_, index) => ({
            number: index + 1,
            capacity: 2,
            isReserved: false,
          })),
        },
      },
      include: {
        users: true,
        tables: true,
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

/////////////////////////////////menu

export async function getRestaurantMenu(restaurantId: number) {
  try {
    const menuItems = await prisma.menu.findMany({
      where: {
        restaurantId: restaurantId,
      },
    });
    return menuItems;
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return [];
  }
}

// Staff Management
export async function getRestaurantStaff(restaurantId: number) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        users: {
          where: {
            userRole: "STAFF",
          },
          include: {
            role: true,
          },
        },
      },
    });
    return restaurant?.users || [];
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    throw new Error("Failed to fetch staff");
  }
}

export async function deleteStaffMember(userId: number) {
  try {
    const user = await prisma.user.delete({
      where: { id: userId },
    });
    return { success: "Staff member deleted successfully" };
  } catch (error) {
    console.error("Failed to delete staff member:", error);
    return { error: "Failed to delete staff member" };
  }
}

export async function updateStaffMember(
  userId: number,
  data: {
    name: string;
    email: string;
    phone?: string;
    roleId?: number;
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        roleId: data.roleId,
      },
      include: {
        role: true,
      },
    });
    return { success: "Staff member updated successfully", user };
  } catch (error) {
    console.error("Failed to update staff member:", error);
    return { error: "Failed to update staff member" };
  }
}

export async function addStaffMember(
  restaurantId: number,
  data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    roleId?: number;
  }
) {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || "",
        userRole: "STAFF",
        roleId: data.roleId,
        restaurants: {
          connect: { id: restaurantId },
        },
      },
      include: {
        role: true,
      },
    });
    return { success: "Staff member added successfully", user };
  } catch (error) {
    console.error("Failed to add staff member:", error);
    return { error: "Failed to add staff member" };
  }
}
