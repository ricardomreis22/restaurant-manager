"use server";

import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userRole: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.userRole,
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}) {
  try {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        userRole: data.role,
      },
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create user");
  }
}

export async function updateUser(
  id: number,
  data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: UserRole;
  }
) {
  try {
    const updateData: {
      name: string;
      email: string;
      phone: string;
      userRole?: UserRole;
      password?: string;
    } = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      userRole: data.role,
    };

    // Only update password if provided
    if (data.password) {
      updateData.password = data.password;
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(id: number) {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
}
