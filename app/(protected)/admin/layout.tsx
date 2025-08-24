"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.userRole !== "ADMIN") {
      router.push("/restaurants");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user?.userRole !== "ADMIN") {
    return null;
  }

  return <div className="h-full">{children}</div>;
}
