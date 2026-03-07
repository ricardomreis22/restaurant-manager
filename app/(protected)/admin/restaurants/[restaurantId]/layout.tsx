"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminRestaurantProvider,
  useAdminRestaurant,
  AdminTab,
} from "@/contexts/AdminRestaurantContext";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function AdminRestaurantLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const { currentTab, setCurrentTab } = useAdminRestaurant();
  const router = useRouter();

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!restaurantId) return;
    };
    loadRestaurant();
  }, [restaurantId]);

  const handleDisplayChange = (newDisplay: string) => {
    setCurrentTab(newDisplay as AdminTab);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation Header - tabs only on md+; on sm tabs are in navbar burger */}
      <div className="bg-[rgba(36,49,52,255)] text-white">
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center">
            {/* Tabs for larger screens only */}
            <div className="hidden sm:flex gap-2">
              <Button
                onClick={() => handleDisplayChange("floormap")}
                variant={currentTab === "floormap" ? "default" : "ghost"}
                className="text-white"
              >
                Floor Map
              </Button>
              <Button
                onClick={() => handleDisplayChange("employees")}
                variant={currentTab === "employees" ? "default" : "ghost"}
                className="text-white"
              >
                Staff
              </Button>
              <Button
                onClick={() => handleDisplayChange("activity")}
                variant={currentTab === "activity" ? "default" : "ghost"}
                className="text-white"
              >
                Activity Log
              </Button>
              <Button
                onClick={() => handleDisplayChange("menu-management")}
                variant={currentTab === "menu-management" ? "default" : "ghost"}
                className="text-white"
              >
                Menu Management
              </Button>
            </div>

            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/restaurants")}
              className="text-white hover:bg-white hover:text-gray-900 border border-white ml-auto"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Restaurants</span>
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
