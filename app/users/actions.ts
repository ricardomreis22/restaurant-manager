"use server";

import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

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
  }
) {
  try {
    return await prisma.user.update({
      where: { id },
      data,
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
