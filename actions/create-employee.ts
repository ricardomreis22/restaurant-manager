"use server";

import { z } from "zod";
import { NewEmployeeSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";

export const createEmployee = async (
  values: z.infer<typeof NewEmployeeSchema>
) => {
  console.log(values);
  const validatedFields = NewEmployeeSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid credentials",
    };
  }

  const { firstName, lastName, email, phone, pin, role, restaurantId } =
    validatedFields.data;

  const hashedPassword = await bcrypt.hash(pin, 10);

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      error: "User already exists",
      success: undefined,
    };
  }

  await prisma.employee.create({
    data: {
      email,
      pin: hashedPassword,
      firstName,
      lastName,
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
      restaurant: {
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
