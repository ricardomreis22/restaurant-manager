"use server";

import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function checkAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  if (session.user.userRole !== UserRole.ADMIN) {
    redirect("/home");
  }

  return true;
}

// Example of a protected admin action
export async function adminOnlyAction() {
  await checkAdmin();
  // Your admin-only logic here
}
