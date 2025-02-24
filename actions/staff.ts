"use server";

import { z } from "zod";
import { NewStaffSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";
import { UserRole } from "@prisma/client";

export const createStaffMember = async (
  values: z.infer<typeof NewStaffSchema>
) => {
  const validatedFields = NewStaffSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid credentials",
    };
  }

  const { name, email, password, phone, role, restaurantId } =
    validatedFields.data;

  try {
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
        userRole: UserRole.STAFF,
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
      include: {
        role: true,
        restaurants: true,
      },
    });

    return {
      success: "Staff member created successfully!",
      staff,
      error: undefined,
    };
  } catch (error) {
    console.error("Failed to create staff member:", error);
    return { error: "Failed to create staff member" };
  }
};

export async function updateStaffMember(
  userId: number,
  data: {
    name: string;
    email: string;
    phone?: string;
    role: string;
  }
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: {
          connectOrCreate: {
            where: {
              name: data.role,
            },
            create: {
              name: data.role,
            },
          },
        },
      },
      include: {
        role: true,
        restaurants: true,
      },
    });

    return { success: "Staff member updated successfully", user };
  } catch (error) {
    console.error("Failed to update staff member:", error);
    return { error: "Failed to update staff member" };
  }
}

export async function deleteStaffMember(userId: number) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: "Staff member deleted successfully" };
  } catch (error) {
    console.error("Failed to delete staff member:", error);
    return { error: "Failed to delete staff member" };
  }
}

export async function getRestaurantStaff(restaurantId: number) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        users: {
          where: {
            userRole: UserRole.STAFF,
          },
          include: {
            role: true,
            restaurants: true,
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

export async function getStaffRoles() {
  try {
    const roles = await prisma.role.findMany({
      where: {
        employees: {
          some: {
            userRole: UserRole.STAFF,
          },
        },
      },
    });
    return roles;
  } catch (error) {
    console.error("Failed to fetch staff roles:", error);
    throw new Error("Failed to fetch staff roles");
  }
}

export async function assignStaffToRestaurant(
  staffId: number,
  restaurantId: number
) {
  try {
    const user = await prisma.user.update({
      where: { id: staffId },
      data: {
        restaurants: {
          connect: {
            id: restaurantId,
          },
        },
      },
      include: {
        role: true,
        restaurants: true,
      },
    });
    return { success: "Staff member assigned successfully", user };
  } catch (error) {
    console.error("Failed to assign staff to restaurant:", error);
    return { error: "Failed to assign staff to restaurant" };
  }
}

export async function removeStaffFromRestaurant(
  staffId: number,
  restaurantId: number
) {
  try {
    const user = await prisma.user.update({
      where: { id: staffId },
      data: {
        restaurants: {
          disconnect: {
            id: restaurantId,
          },
        },
      },
      include: {
        role: true,
        restaurants: true,
      },
    });
    return { success: "Staff member removed successfully", user };
  } catch (error) {
    console.error("Failed to remove staff from restaurant:", error);
    return { error: "Failed to remove staff from restaurant" };
  }
}
