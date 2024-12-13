"use server";

import prisma from "@/lib/prisma";

export async function createCategory(menuId: number, name: string) {
  try {
    const category = await prisma.category.create({
      data: {
        name,
        menuId,
      },
    });
    return category;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
}

export async function createMenuItem(
  categoryId: number,
  data: {
    name: string;
    price: number;
    imageUrl?: string;
  }
) {
  try {
    const menuItem = await prisma.menuItem.create({
      data: {
        ...data,
        categoryId,
      },
    });
    return menuItem;
  } catch (error) {
    console.error("Failed to create menu item:", error);
    throw error;
  }
}

export async function getMenuWithCategories(menuId: number) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        categories: {
          include: {
            items: true,
          },
        },
      },
    });
    return menu;
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    throw error;
  }
}
