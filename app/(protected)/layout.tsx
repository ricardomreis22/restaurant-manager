"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getRestaurantName } from "@/actions/restaurants";
import Image from "next/image";

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
      setIsLoading(false);
    } else if (pathname.includes("/tables/")) {
      setCurrentPage("table");
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
      const match = pathname.match(/\/restaurants\/(\d+)/);
      if (match) {
        const restaurantId = parseInt(match[1]);
        loadRestaurant(restaurantId);
      } else {
        setIsLoading(false);
      }
    } else {
      setCurrentPage("general");
      setIsLoading(false);
    }
  }, [pathname]);

  const loadRestaurant = async (restaurantId: number) => {
    try {
      const data = await getRestaurantName(restaurantId);
      if (data) setRestaurantName(data.name);
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

  return (
    <div className="h-screen flex flex-col">
      {!match && (
        <nav className="flex p-4 justify-between items-center bg-[rgba(36,49,52,255)] text-white">
          {renderNavContent()}
          <LogoutButton />
        </nav>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
