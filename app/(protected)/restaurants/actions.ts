"use server";

import { auth } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { NewStaffSchema } from "@/schemas";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

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
        menu: true,
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

    // if (session.user.userRole !== "ADMIN") {
    //   throw new Error("Staff cannot create a restaurant");
    // }

    // Check for existing restaurant with same address
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { address: formData.address },
          { phone: formData.phone || "" },
          { email: formData.email || "" },
        ],
      },
    });

    if (existingRestaurant) {
      if (existingRestaurant.address === formData.address) {
        return { error: "A restaurant at this address already exists" };
      }
      if (existingRestaurant.phone === formData.phone) {
        return { error: "This phone number is already registered" };
      }
      if (existingRestaurant.email === formData.email) {
        return { error: "This email is already registered" };
      }
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

// Staff Management
export async function getRestaurantStaff(restaurantId: number) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        users: {
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

export async function addStaffMember(values: z.infer<typeof NewStaffSchema>) {
  try {
    const validatedFields = NewStaffSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: "Invalid credentials",
      };
    }

    const { name, email, password, phone, role, restaurantId } =
      validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        error: "User already exists",
        success: undefined,
      };
    }

    const staff = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        userRole: "STAFF",
        role: {
          connectOrCreate: {
            where: {
              name: role,
            },
            create: {
              name: role,
            },
          },
        },
        restaurants: {
          connect: {
            id: restaurantId,
          },
        },
      },
    });

    return { success: "Staff member added successfully", staff };
  } catch (error) {
    console.error("Failed to add staff member:", error);
    return { error: "Failed to add staff member" };
  }
}

export async function createMenuItem(
  restaurantId: number,
  item: {
    name: string;
    description?: string;
    price: number;
    category: string;
  }
) {
  try {
    const menuItem = await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isAvailable: true,
        restaurant: {
          connect: {
            id: restaurantId,
          },
        },
      },
    });
    return menuItem;
  } catch (error) {
    console.error("Failed to create menu item:", error);
    throw error;
  }
}

export async function getMenu(restaurantId: number) {
  if (!restaurantId) return [];

  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurantId,
      },
      orderBy: {
        category: "asc",
      },
    });
    return menuItems;
  } catch (error) {
    console.error("Failed to fetch menu items:", error);
    return [];
  }
}

export async function updateMenuItem(
  id: number,
  item: {
    name: string;
    description?: string;
    price: number;
    category: string;
  }
) {
  try {
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
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
    await prisma.menuItem.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    throw error;
  }
}
