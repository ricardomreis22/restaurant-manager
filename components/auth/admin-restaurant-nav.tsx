"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdminRestaurant } from "@/contexts/AdminRestaurantContext";
import type { AdminTab } from "@/contexts/AdminRestaurantContext";
import { cn } from "@/lib/utils";

export const ADMIN_RESTAURANT_TABS: { id: AdminTab; label: string }[] = [
  { id: "floormap", label: "Floor Map" },
  { id: "employees", label: "Staff" },
  { id: "activity", label: "Activity Log" },
  { id: "menu-management", label: "Menu Management" },
];

export function isAdminRestaurantPath(pathname: string) {
  return /^\/admin\/restaurants\/\d+$/.test(pathname);
}

/** Horizontal tabs for admin restaurant — shown in the top nav at all breakpoints. */
export function AdminRestaurantDesktopTabs() {
  const { currentTab, setCurrentTab } = useAdminRestaurant();

  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-primary-foreground/10 p-1">
      {ADMIN_RESTAURANT_TABS.map(({ id, label }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "shrink-0 text-primary-foreground hover:bg-primary-foreground/15",
            currentTab === id && "bg-primary-foreground/20 font-medium",
          )}
          onClick={() => setCurrentTab(id)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

/** Centered admin tabs in the top nav on `/admin/restaurants/[id]` (all screen sizes). */
export function AdminRestaurantDesktopTabsGate() {
  const pathname = usePathname();
  if (!isAdminRestaurantPath(pathname)) return null;
  return (
    <div className="flex w-full min-w-0 justify-center overflow-x-auto px-1 sm:px-2">
      <AdminRestaurantDesktopTabs />
    </div>
  );
}
