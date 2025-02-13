import { auth } from "@/auth";

export async function currentUser() {
  const session = await auth();
  return session?.user;
}

export async function currentUserRole() {
  const session = await auth();
  return session?.user?.userRole;
}

export async function currentUserId() {
  const session = await auth();
  return session?.user?.id;
}
