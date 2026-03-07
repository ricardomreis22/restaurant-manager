"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminRestaurantProvider,
  useAdminRestaurant,
  AdminTab,
} from "@/contexts/AdminRestaurantContext";

function AdminRestaurantLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const { currentTab, setCurrentTab } = useAdminRestaurant();

  useEffect(() => {
    if (!restaurantId) return;
  }, [restaurantId]);

  const handleDisplayChange = (newDisplay: string) => {
    setCurrentTab(newDisplay as AdminTab);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Tabs only on md+; on sm use navbar burger */}
      <div className="bg-[rgba(36,49,52,255)] text-white">
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            <Button
              onClick={() => handleDisplayChange("floormap")}
              variant={currentTab === "floormap" ? "default" : "ghost"}
              className="text-white hidden sm:inline-flex"
            >
              Floor Map
            </Button>
            <Button
              onClick={() => handleDisplayChange("employees")}
              variant={currentTab === "employees" ? "default" : "ghost"}
              className="text-white hidden sm:inline-flex"
            >
              Staff
            </Button>
            <Button
              onClick={() => handleDisplayChange("activity")}
              variant={currentTab === "activity" ? "default" : "ghost"}
              className="text-white hidden sm:inline-flex"
            >
              Activity Log
            </Button>
            <Button
              onClick={() => handleDisplayChange("menu-management")}
              variant={currentTab === "menu-management" ? "default" : "ghost"}
              className="text-white hidden sm:inline-flex"
            >
              Menu Management
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export default function AdminRestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRestaurantProvider>
      <AdminRestaurantLayoutContent>{children}</AdminRestaurantLayoutContent>
    </AdminRestaurantProvider>
  );
}
