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
import { cn } from "@/lib/utils";
import {
  ADMIN_RESTAURANT_TABS,
  isAdminRestaurantPath,
} from "@/components/auth/admin-restaurant-nav";
import { ArrowLeft, Menu } from "lucide-react";

export const LogoutButton = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTab, setCurrentTab } = useAdminRestaurant();

  const isAdminRestaurant = isAdminRestaurantPath(pathname);

  const mobileMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 lg:hidden"
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

  if (isAdminRestaurant) {
    return (
      <div className="flex items-center gap-2">
        {mobileMenu}
        <Button
          type="button"
          variant="ghost"
          className="hidden text-primary-foreground hover:bg-primary-foreground/10 lg:inline-flex"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          Logout
        </Button>
      </div>
    );
  }

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
