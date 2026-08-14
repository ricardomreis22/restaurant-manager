"use server";

import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export async function checkAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    return { success: false as const, error: "Not authenticated" };
  }

  if (session.user.userRole !== UserRole.ADMIN) {
    return { success: false as const, error: "Unauthorized" };
  }

  return { success: true as const };
}

// Example of a protected admin action
