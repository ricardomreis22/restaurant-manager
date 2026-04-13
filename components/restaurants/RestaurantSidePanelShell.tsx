"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminRestaurantSidePanel } from "@/components/restaurants/AdminRestaurantSidePanel";
import { useAdminRestaurant } from "@/contexts/AdminRestaurantContext";

const RESTAURANT_ID_PATH = /^\/(?:admin\/)?restaurants\/(\d+)/;

/**
 * Wraps protected content when the URL is under `/restaurants/[id]` or
 * `/admin/restaurants/[id]` (including nested routes like `/tables/...`) so the
 * slide-out sidebar shares one height with the page.
 */
export function RestaurantSidePanelShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { setSidePanelOpen } = useAdminRestaurant();
  const match = pathname.match(RESTAURANT_ID_PATH);
  const restaurantId = match ? parseInt(match[1], 10) : null;

  useEffect(() => {
    setSidePanelOpen(false);
  }, [pathname, setSidePanelOpen]);

  if (restaurantId == null) {
    return (
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden [flex-basis:0]">
      <AdminRestaurantSidePanel restaurantId={restaurantId} />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
