"use server";

import prisma from "@/lib/prisma";

export async function getOwners() {
  try {
    return await prisma.owner.findMany({
      include: {
        restaurants: true,
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch owners");
  }
}

export async function createOwner(data: {
  name: string;
  email: string;
  phone: string;
}) {
  try {
    return await prisma.owner.create({
      data,
    });
  } catch (error) {
    throw new Error("Failed to create owner");
  }
}

export async function updateOwner(
  id: number,
  data: {
    name: string;
    email: string;
    phone: string;
  }
) {
  try {
    return await prisma.owner.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw new Error("Failed to update owner");
  }
}

export async function deleteOwner(id: number) {
  try {
    return await prisma.owner.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Failed to delete owner");
  }
}
