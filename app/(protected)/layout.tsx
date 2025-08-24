"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getRestaurant } from "@/actions/restaurants";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const match = pathname.match(/\/restaurants\/(\d+)\/tables\/(\d+)/);

  useEffect(() => {
    setIsLoading(true);
    // Determine current page context
    if (pathname.includes("/admin/")) {
      setCurrentPage("admin");
      setIsLoading(false);
    } else if (pathname.includes("/tables/")) {
      setCurrentPage("table");
      // Extract restaurant ID from path for table pages
      const match = pathname.match(/\/restaurants\/(\d+)\/tables\/(\d+)/);
      if (match) {
        console.log("match", match);
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
      // Extract restaurant ID from path for restaurant pages

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
          <img src="/favicon.ico" alt="logo" className="w-15 h-12" />
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      );
    }

    switch (currentPage) {
      case "admin":
        return (
          <div className="flex items-center gap-4">
            <img src="/favicon.ico" alt="logo" className="w-15 h-12" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
        );
      case "restaurant":
        return (
          <div className="flex items-center gap-4">
            <img src="/favicon.ico" alt="logo" className="w-15 h-12" />
            <span className="text-lg font-semibold">{restaurantName}</span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-4">
            <img src="/favicon.ico" alt="logo" className="w-15 h-12" />
            <span className="text-lg font-semibold">Restaurant Manager</span>
          </div>
        );
    }
  };

  console.log("match", match);

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
