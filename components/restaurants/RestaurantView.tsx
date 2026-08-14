"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getRestaurant, getRestaurantTables } from "@/actions/restaurants";
import Floormap from "@/components/restaurants/FloorMap";
import StaffPage from "@/components/restaurants/StaffPage";
import MenuPage from "@/components/restaurants/MenuPage";
import ActivityLogPage from "@/components/restaurants/ActivityLogPage";
import { checkAdmin } from "@/actions/admin";
import { useAdminRestaurantOptional } from "@/contexts/AdminRestaurantContext";
import { AdminTab } from "@/contexts/AdminRestaurantContext";

type RestaurantSummary = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
};

interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
  isLocked: boolean;
  area?: string;
  x: number;
  y: number;
}

interface RestaurantViewProps {
  isAdminView?: boolean;
}

export default function RestaurantView({
  isAdminView = false,
}: RestaurantViewProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const [restaurant, setRestaurant] = useState<RestaurantSummary | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Always call the hook, then conditionally use its value
  const adminContext = useAdminRestaurantOptional();
  const [display, setDisplay] = useState<string>("floormap");
  const prevDisplayRef = useRef<string | null>(null);

  // Sync display from URL tab param (staff view only)
  useEffect(() => {
    if (isAdminView) return;

    const tab = searchParams.get("tab");
    if (
      tab &&
      ["floormap", "menu", "menu-management", "employees", "activity"].includes(
        tab,
      )
    ) {
      setDisplay(tab);
    }
  }, [isAdminView, searchParams]);

  const adminSetDisplay = async (newDisplay: string) => {
    const result = await checkAdmin();
    if (!result.success) {
      console.error("Unauthorized action:", result.error);
      return;
    }
    if (isAdminView && adminContext) {
      adminContext.setCurrentTab(newDisplay as AdminTab);
    } else {
      setDisplay(newDisplay);
    }
  };

  useEffect(() => {
    if (Number.isNaN(restaurantId) || restaurantId < 1) {
      setLoadError("Invalid restaurant");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [restaurantData, tablesData] = await Promise.all([
          getRestaurant(restaurantId),
          getRestaurantTables(restaurantId),
        ]);

        if (!restaurantData) {
          setRestaurant(null);
          setLoadError("Restaurant not found or failed to load");
          return;
        }

        setRestaurant(restaurantData);
        setTables(tablesData);
      } catch (error) {
        console.error("Failed to load restaurant:", error);
        setLoadError("Failed to load restaurant");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  // Refresh tables when switching back to floormap view to get latest positions
  useEffect(() => {
    const currentDisplayValue =
      isAdminView && adminContext ? adminContext.currentTab : display;

    // Only refresh when switching TO floormap from another tab (not on initial load)
    if (
      currentDisplayValue === "floormap" &&
      prevDisplayRef.current !== null &&
      prevDisplayRef.current !== "floormap"
    ) {
      const refreshTables = async () => {
        try {
          const tablesData = await getRestaurantTables(restaurantId);
          setTables(tablesData);
        } catch (error) {
          console.error("Failed to refresh tables:", error);
        }
      };
      refreshTables();
    }

    // Update the previous display value
    prevDisplayRef.current = currentDisplayValue;
  }, [display, isAdminView, adminContext, restaurantId]);

  // Get the current display value
  const currentDisplay =
    isAdminView && adminContext ? adminContext.currentTab : display;

  // Create wrapper functions for setDisplay to handle type conversion
  const handleSetDisplay = (newDisplay: string) => {
    if (isAdminView && adminContext) {
      adminContext.setCurrentTab(newDisplay as AdminTab);
    } else {
      setDisplay(newDisplay);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  if (loadError || !restaurant) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-medium">
          {loadError ?? "Restaurant not found"}
        </p>
        <p className="text-sm text-primary-foreground/70">
          Go back to restaurants and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {/* flex-1 + h-full: fill space below nav only (never 100vh) */}
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        {currentDisplay === "employees" && isAdminView ? (
          <StaffPage />
        ) : currentDisplay === "floormap" ? (
          <Floormap
            tables={tables}
            isAdminView={isAdminView}
            restaurantId={restaurantId}
            restaurantName={restaurant.name}
            display={currentDisplay}
            setDisplay={handleSetDisplay}
            adminSetDisplay={adminSetDisplay}
          />
        ) : currentDisplay === "menu" && isAdminView ? (
          <MenuPage restaurantId={restaurantId} />
        ) : currentDisplay === "menu-management" && isAdminView ? (
          <MenuPage restaurantId={restaurantId} />
        ) : currentDisplay === "activity" ? (
          <ActivityLogPage
            restaurantId={restaurantId}
            isAdminView={isAdminView}
            setDisplay={handleSetDisplay}
            adminSetDisplay={adminSetDisplay}
          />
        ) : null}
      </div>
    </div>
  );
}
