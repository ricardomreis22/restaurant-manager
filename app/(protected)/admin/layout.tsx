"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <div className="bg-gray-100 min-h-screen">{children}</div>
    </div>
  );
}
