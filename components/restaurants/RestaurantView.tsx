"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRestaurant, getRestaurantTables } from "@/actions/restaurants";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import Floormap from "@/components/restaurants/FloorMap";
import StaffPage from "@/components/restaurants/StaffPage";
import MenuPage from "@/components/restaurants/MenuPage";
import { TableView } from "@/components/restaurants/TableView";
import ActivityLogPage from "@/components/restaurants/ActivityLogPage";
import { useCurrentRole } from "@/hooks/use-current-role";
import { checkAdmin } from "@/actions/admin";
import { useAdminRestaurantOptional } from "@/contexts/AdminRestaurantContext";
import { AdminTab } from "@/contexts/AdminRestaurantContext";
import type { Prisma } from "@prisma/client";

type Restaurant = Prisma.RestaurantGetPayload<{
  include: {
    users: true;
    tables: true;
    menuItems: true;
    inventory: true;
    promotions: true;
    reviews: true;
    events: true;
    suppliers: true;
    reports: true;
  };
}>;

interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
  isLocked: boolean;
  x: number;
  y: number;
}

interface RestaurantViewProps {
  isAdminView?: boolean;
}

export default function RestaurantView({
  isAdminView = false,
}: RestaurantViewProps) {
  const router = useRouter();
  const params = useParams();
  const userRole = useCurrentRole();
  const restaurantId = parseInt(params.restaurantId as string);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);

  // Always call the hook, then conditionally use its value
  const adminContext = useAdminRestaurantOptional();
  const [display, setDisplay] = useState<string>("floormap");
  const prevDisplayRef = useRef<string | null>(null);

  // Check for initial display from URL search params (only for non-admin view)
  useEffect(() => {
    if (!isAdminView) {
      const urlParams = new URLSearchParams(window.location.search);
      const initialDisplay = urlParams.get("tab");
      if (
        initialDisplay &&
        [
          "floormap",
          "menu",
          "menu-management",
          "employees",
          "activity",
        ].includes(initialDisplay)
      ) {
        setDisplay(initialDisplay);
      }
    }
  }, [isAdminView]);

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const adminSetDisplay = async (newDisplay: string) => {
    try {
      await checkAdmin();
      if (isAdminView && adminContext) {
        adminContext.setCurrentTab(newDisplay as AdminTab);
      } else {
        setDisplay(newDisplay);
      }
    } catch (error) {
      console.error("Unauthorized action:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const restaurantData = await getRestaurant(restaurantId);
      const tablesData = await getRestaurantTables(restaurantId);

      setRestaurant(restaurantData);
      setTables(tablesData);
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
        const tablesData = await getRestaurantTables(restaurantId);
        setTables(tablesData);
      };
      refreshTables();
    }

    // Update the previous display value
    prevDisplayRef.current = currentDisplayValue;
  }, [display, isAdminView, adminContext, restaurantId]);

  const handleTableSelect = (tableId: number) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      setSelectedTable(table);
    }
  };

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

  if (!restaurant) {
    return <div>Loading...</div>;
  }
  return (
    <div className="h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTable ? (
          <TableView
            table={selectedTable}
            restaurantId={restaurantId}
            onClose={() => setSelectedTable(null)}
          />
        ) : currentDisplay === "employees" && isAdminView ? (
          <StaffPage />
        ) : currentDisplay === "floormap" ? (
          <Floormap
            tables={tables}
            onTableSelect={handleTableSelect}
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
      {userRole === "ADMIN" && !isAdminView && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => router.push(`/admin/restaurants/${restaurantId}`)}
            variant="outline"
            size="sm"
            className="transform transition-transform duration-200 hover:scale-110 group shadow-lg text-black gap-2 px-3 py-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden group-hover:inline ml-2 sm:inline">
              Admin View
            </span>
          </Button>
        </div>
      )}
      {userRole === "ADMIN" && isAdminView && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => router.push(`/restaurants/${restaurantId}`)}
            variant="outline"
            size="sm"
            className="transform transition-transform duration-200 hover:scale-110 group shadow-lg text-red-600 hover:text-red-800 gap-2 px-3 py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden group-hover:inline ml-2 sm:inline">
              Leave Admin
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
