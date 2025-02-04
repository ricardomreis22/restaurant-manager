"use server";

import { z } from "zod";
import { NewStaffSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";

export const createEmployee = async (
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

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      error: "User already exists",
      success: undefined,
    };
  }

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
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

  // TODO: Send verification email

  return {
    success: "Employee created successfully!",
    error: undefined,
  };
};

export async function updateEmployee(data: {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}) {
  try {
    await prisma.user.update({
      where: { id: data.id },
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
    });

    return { success: "Employee updated successfully" };
  } catch (error) {
    return { error: "Failed to update employee" };
  }
}

export const deleteEmployee = async (employeeId: number) => {
  try {
    await prisma.user.delete({
      where: {
        id: employeeId,
      },
    });
    return { success: "Employee deleted successfully" };
  } catch (error) {
    return { error: "Failed to delete employee" };
  }
};
