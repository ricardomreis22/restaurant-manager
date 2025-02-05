"use server";

import prisma from "@/lib/prisma";

export async function createCategory(data: {
  name: string;
  description?: string;
  restaurantId: number;
}) {
  try {
    const category = await prisma.category.create({
      data,
    });
    return category;
  } catch (error) {
    console.error("Failed to create category:", error);
    throw error;
  }
}

export async function updateCategory(
  id: number,
  data: {
    name: string;
    description?: string;
  }
) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return category;
  } catch (error) {
    console.error("Failed to update category:", error);
    throw error;
  }
}

export async function deleteCategory(id: number) {
  try {
    // First, update all menu items in this category to a default category or null
    await prisma.menuItems.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    // Then delete the category
    await prisma.category.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Failed to delete category:", error);
    throw error;
  }
}

export async function getCategories(restaurantId: number) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurantId,
      },
      include: {
        menuItems: true,
      },
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getMenuItems(restaurantId: number) {
  try {
    const menuItems = await prisma.menuItems.findMany({
      where: {
        restaurantId: restaurantId,
      },
      include: {
        category: true,
      },
    });
    return menuItems;
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return [];
  }
}

export async function createMenuItem(
  restaurantId: number,
  data: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
  }
) {
  if (!restaurantId) return "Restaurant not found";

  if (!data.categoryId) return "Category not found";

  try {
    const menuItem = await prisma.menuItems.create({
      data: {
        ...data,
        restaurantId,
      },
      include: {
        category: true,
      },
    });
    return menuItem;
  } catch (error) {
    console.error("Failed to create menu item:", error);
    throw error;
  }
}

export async function updateMenuItem(
  id: number,
  data: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
  }
) {
  try {
    const menuItem = await prisma.menuItems.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
    return menuItem;
  } catch (error) {
    console.error("Failed to update menu item:", error);
    throw error;
  }
}

export async function deleteMenuItem(id: number) {
  try {
    await prisma.menuItems.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    throw error;
  }
}

export async function getMenuWithCategories(menuId: number) {
  try {
    const menu = await prisma.menuItems.findUnique({
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

export async function getMenuItemsByCategory(
  restaurantId: number,
  categoryId: number
) {
  try {
    const menuItems = await prisma.menuItems.findMany({
      where: {
        restaurantId: restaurantId,
        categoryId: categoryId,
      },
    });

    return menuItems;
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return [];
  }
}
