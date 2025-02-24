"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useCurrentUser();

  return <>{children}</>;
}
