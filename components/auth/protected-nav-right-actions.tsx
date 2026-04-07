"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowLeft, List, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";

const ADMIN_RESTAURANT_PATH = /^\/admin\/restaurants\/(\d+)$/;

export function ProtectedNavRightActions() {
  const pathname = usePathname();
  const router = useRouter();
  const match = pathname.match(ADMIN_RESTAURANT_PATH);

  if (match) {
    const restaurantId = match[1];
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/15"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onSelect={() => router.push(`/restaurants/${restaurantId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Leave Admin
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/restaurants")}>
            <List className="mr-2 h-4 w-4" />
            Back to Restaurants
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <LogoutButton />;
}
