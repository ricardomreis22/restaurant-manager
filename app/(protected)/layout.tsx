"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { getRestaurant } from "@/actions/restaurants";
import Image from "next/image";
import { Menu } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Determine current page context
    if (pathname.includes("/admin/")) {
      setCurrentPage("admin");
    } else if (pathname.includes("/tables/")) {
      setCurrentPage("table");
      // Extract restaurant ID from path for table pages
      const match = pathname.match(/\/restaurants\/(\d+)\/tables\/(\d+)/);
      if (match) {
        const restaurantId = parseInt(match[1]);
        loadRestaurant(restaurantId);
      } else {
        setIsLoading(false);
      }
    } else if (
      pathname.includes("/restaurants/") &&
      !pathname.includes("/tables/")
    ) {
      setCurrentPage("restaurant");
    } else {
      setCurrentPage("general");
    }
    setIsLoading(false);
  }, [pathname]);

  const loadRestaurant = async (restaurantId: number) => {
    try {
      const restaurantData = await getRestaurant(restaurantId);
      if (restaurantData) {
        setRestaurantName(restaurantData.name);
      }
    } catch (error) {
      console.error("Failed to load restaurant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNavContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-4">
          <Image
            src="/favicon.ico"
            alt="logo"
            width={60}
            height={48}
            className="w-15 h-12"
          />
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      );
    }

    switch (currentPage) {
      case "admin":
        return (
          <div className="flex items-center gap-4">
            <Image
              src="/favicon.ico"
              alt="logo"
              width={60}
              height={48}
              className="w-15 h-12"
            />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
        );
      case "restaurant":
        return (
          <div className="flex items-center gap-4">
            <Image
              src="/favicon.ico"
              alt="logo"
              width={60}
              height={48}
              className="w-15 h-12"
            />
            <span className="text-lg font-semibold">{restaurantName}</span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-4">
            <Image
              src="/favicon.ico"
              alt="logo"
              width={60}
              height={48}
              className="w-15 h-12"
            />
            <span className="text-lg font-semibold">Restaurant Manager</span>
          </div>
        );
    }
  };

  const match = pathname.match(/\/restaurants\/(\d+)\/tables\/(\d+)/);
  const adminRestaurantMatch = pathname.match(/\/admin\/restaurants\/(\d+)/);
  const adminRestaurantId = adminRestaurantMatch ? adminRestaurantMatch[1] : null;

  const adminTabs = [
    { id: "floormap", label: "Floor Map" },
    { id: "employees", label: "Staff" },
    { id: "activity", label: "Activity Log" },
    { id: "menu-management", label: "Menu Management" },
  ];

  return (
    <div className="h-screen flex flex-col">
      {!match && (
        <nav className="flex p-4 justify-between items-center bg-[rgba(36,49,52,255)] text-white">
          {renderNavContent()}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-white/10"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                {adminRestaurantId && currentPage === "admin" && adminTabs.map((tab) => (
                  <DropdownMenuItem key={tab.id} asChild>
                    <Link
                      href={`/admin/restaurants/${adminRestaurantId}?tab=${tab.id}`}
                      className="block w-full"
                    >
                      {tab.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {(adminRestaurantId && currentPage === "admin") && (
                  <div className="my-1 border-t border-border" />
                )}
                <DropdownMenuItem
                  onSelect={() => signOut({ callbackUrl: "/auth/login" })}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </div>
        </nav>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
