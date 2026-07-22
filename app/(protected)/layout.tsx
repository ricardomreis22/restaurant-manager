"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { ProtectedNavRightActions } from "@/components/auth/protected-nav-right-actions";
import { ProtectedNavLogo } from "@/components/auth/protected-nav-logo";
import { AdminRestaurantProvider } from "@/contexts/AdminRestaurantContext";

const HIDE_NAV_PATH = /^\/restaurants\/\d+\/tables\/\d+/;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PATH.test(pathname);

  return (
    <AdminRestaurantProvider>
      <div className="flex h-screen flex-col">
        {!hideNav && (
          <nav className="relative z-[110] flex items-center justify-between gap-4 bg-primary p-4 text-primary-foreground">
            <div className="min-w-0 shrink-0">
              <ProtectedNavLogo />
            </div>
            <div className="shrink-0">
              <Suspense fallback={null}>
                <ProtectedNavRightActions />
              </Suspense>
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
