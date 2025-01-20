"use server";

import prisma from "@/lib/prisma";

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

export async function getRestaurant(restaurantId: number) {
  try {
    return await prisma.restaurant.findUnique({
      where: { id: restaurantId },
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

export async function getEmployees(restaurantId: number) {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        restaurantId: restaurantId,
      },
      // so includes the role model, so we can get what´s inside the role model
      include: {
        role: true,
      },
    });
    return employees;
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    throw new Error("Failed to fetch employees");
  }
}
