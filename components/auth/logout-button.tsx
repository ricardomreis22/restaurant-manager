"use client";

import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminRestaurant } from "@/contexts/AdminRestaurantContext";
import type { AdminTab } from "@/contexts/AdminRestaurantContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, Menu } from "lucide-react";

const ADMIN_RESTAURANT_TABS: { id: AdminTab; label: string }[] = [
  { id: "floormap", label: "Floor Map" },
  { id: "employees", label: "Staff" },
  { id: "activity", label: "Activity Log" },
  { id: "menu-management", label: "Menu Management" },
];

export const LogoutButton = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTab, setCurrentTab } = useAdminRestaurant();

  const isAdminRestaurant = /^\/admin\/restaurants\/\d+$/.test(pathname);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        {isAdminRestaurant && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/restaurants")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Restaurants
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {ADMIN_RESTAURANT_TABS.map(({ id, label }) => (
              <DropdownMenuItem
                key={id}
                className={cn(
                  "cursor-pointer",
                  currentTab === id && "bg-accent font-medium",
                )}
                onClick={() => setCurrentTab(id)}
              >
                {label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
