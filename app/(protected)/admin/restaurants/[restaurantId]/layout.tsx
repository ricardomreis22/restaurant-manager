"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getRestaurant } from "@/actions/restaurants";
import { LogoutButton } from "@/components/auth/logout-button";

export default function AdminRestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [currentDisplay, setCurrentDisplay] = useState<string>("floormap");
  const restaurantId = parseInt(params.restaurantId as string);

  useEffect(() => {
    const loadRestaurant = async () => {
      if (restaurantId) {
        const restaurantData = await getRestaurant(restaurantId);
        if (restaurantData) {
          setRestaurantName(restaurantData.name);
        }
      }
    };

    loadRestaurant();
  }, [restaurantId]);

  // Check for initial display from URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialDisplay = urlParams.get("tab");
    if (
      initialDisplay &&
      ["floormap", "menu", "menu-management", "employees", "activity"].includes(
        initialDisplay
      )
    ) {
      setCurrentDisplay(initialDisplay);
    }
  }, []);

  const handleDisplayChange = (newDisplay: string) => {
    setCurrentDisplay(newDisplay);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newDisplay);
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation Header */}
      <div className="bg-[rgba(36,49,52,255)] text-white">
        {/* Navigation Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <Button
              onClick={() => handleDisplayChange("floormap")}
              variant={currentDisplay === "floormap" ? "default" : "ghost"}
              className="text-white"
            >
              Floor Map
            </Button>
            <Button
              onClick={() => handleDisplayChange("activity")}
              variant={currentDisplay === "activity" ? "default" : "ghost"}
              className="text-white"
            >
              Activity Log
            </Button>
            <Button
              onClick={() => handleDisplayChange("menu-management")}
              variant={
                currentDisplay === "menu-management" ? "default" : "ghost"
              }
              className="text-white"
            >
              Menu Management
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
