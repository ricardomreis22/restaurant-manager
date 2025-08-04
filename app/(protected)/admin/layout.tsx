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

  return (
    <div>
      <nav className="p-4 flex justify-between items-center bg-[rgba(36,49,52,255)] text-white">
        <div className="flex items-center gap-4">
          <img src="/favicon.ico" alt="logo" className="w-15 h-12" />
        </div>
        <LogoutButton />
      </nav>
      <div className="min-h-screen">{children}</div>
    </div>
  );
}
