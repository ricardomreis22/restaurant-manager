"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getRestaurant } from "@/actions/restaurants";
import {
  AdminRestaurantProvider,
  useAdminRestaurant,
} from "@/contexts/AdminRestaurantContext";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

function AdminRestaurantLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const restaurantId = parseInt(params.restaurantId as string);
  const { currentTab, setCurrentTab } = useAdminRestaurant();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleDisplayChange = (newDisplay: string) => {
    setCurrentTab(newDisplay as any);
    setIsMenuOpen(false); // Close menu when tab is selected
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation Header */}
      <div className="bg-[rgba(36,49,52,255)] text-white">
        {/* Navigation Tabs */}
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center">
            {/* Burger Menu for small screens */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:bg-white hover:text-gray-900"
                size="sm"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Tabs for larger screens */}
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

            {/* Back button on the right side */}
            <Button
              variant="ghost"
              onClick={() => router.push("/restaurants")}
              className="text-white hover:bg-white hover:text-gray-900 border border-white"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 " />
              <span className="hidden sm:inline">Back to Restaurants</span>
            </Button>
          </div>

          {/* Mobile Menu - Dropdown for small screens */}
          {isMenuOpen && (
            <div className="sm:hidden mt-4 bg-white rounded-lg shadow-lg">
              <div className="flex flex-col gap-1 p-2">
                <Button
                  onClick={() => handleDisplayChange("floormap")}
                  variant={currentTab === "floormap" ? "default" : "ghost"}
                  className="justify-start text-gray-900 hover:bg-gray-100"
                  size="sm"
                >
                  Floor Map
                </Button>
                <Button
                  onClick={() => handleDisplayChange("employees")}
                  variant={currentTab === "employees" ? "default" : "ghost"}
                  className="justify-start text-gray-900 hover:bg-gray-100"
                  size="sm"
                >
                  Staff
                </Button>
                <Button
                  onClick={() => handleDisplayChange("activity")}
                  variant={currentTab === "activity" ? "default" : "ghost"}
                  className="justify-start text-gray-900 hover:bg-gray-100"
                  size="sm"
                >
                  Activity Log
                </Button>
                <Button
                  onClick={() => handleDisplayChange("menu-management")}
                  variant={
                    currentTab === "menu-management" ? "default" : "ghost"
                  }
                  className="justify-start text-gray-900 hover:bg-gray-100"
                  size="sm"
                >
                  Menu Management
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
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
