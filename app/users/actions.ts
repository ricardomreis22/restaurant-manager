"use server";

import prisma from "@/lib/prisma";

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      include: {
        restaurants: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch users");
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
    throw new Error("Failed to update User");
  }
}

export async function deleteUser(id: number) {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Failed to delete User");
  }
}
