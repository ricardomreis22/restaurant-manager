"use client";

import { ProtectedNavRightActions } from "@/components/auth/protected-nav-right-actions";
import { ProtectedNavLogo } from "@/components/auth/protected-nav-logo";
import { AdminRestaurantProvider } from "@/contexts/AdminRestaurantContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRestaurantProvider>
      <div className="h-screen flex flex-col">
        <nav className="relative z-[110] flex items-center justify-between gap-4 bg-primary p-4 text-primary-foreground">
          <div className="min-w-0 shrink-0">
            <ProtectedNavLogo />
          </div>
          <div className="shrink-0">
            <ProtectedNavRightActions />
          </div>
        </nav>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AdminRestaurantProvider>
  );
}
