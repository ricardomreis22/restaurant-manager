"use client";

import { ProtectedNavRightActions } from "@/components/auth/protected-nav-right-actions";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AdminRestaurantProvider } from "@/contexts/AdminRestaurantContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const match = pathname.match(/\/restaurants\/(\d+)\/tables\/(\d+)/);

  return (
    <AdminRestaurantProvider>
      <div className="h-screen flex flex-col">
        {!match && (
          <nav className="relative z-[110] flex items-center justify-between gap-4 bg-primary p-4 text-primary-foreground">
            <div className="min-w-0 shrink-0">
              <div className="flex items-center">
                <Image
                  src="/favicon.ico"
                  alt="logo"
                  width={60}
                  height={48}
                  className="w-15 h-12"
                />
              </div>
            </div>
            <div className="shrink-0">
              <ProtectedNavRightActions />
            </div>
          </nav>
        )}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AdminRestaurantProvider>
  );
}
