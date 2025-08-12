"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getRestaurant,
  getRestaurantTables,
  deleteRestaurant,
} from "@/actions/restaurants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash,
  ArrowLeft,
  Settings,
  Menu as MenuIcon,
} from "lucide-react";
import Floormap from "@/components/restaurants/FloorMap";
import StaffPage from "@/components/restaurants/StaffPage";
import MenuPage from "@/components/restaurants/MenuPage";
import { TableView } from "@/components/restaurants/TableView";
import ActivityLogPage from "@/components/restaurants/ActivityLogPage";
import { useCurrentRole } from "@/hooks/use-current-role";
import { checkAdmin } from "@/actions/admin";
import { LogoutButton } from "@/components/auth/logout-button";
interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
  isLocked: boolean;
}

interface ActivityLog {
  id: number;
  sessionId: number;
  userId: number;
  activityType: string;
  description: string;
  metadata: any;
  timestamp: Date;
  user: {
    name: string;
  };
}

interface TableSession {
  id: number;
  tableId: number;
  openedAt: Date;
  closedAt: Date | null;
  totalAmount: number;
  numberOfGuests: number;
  duration: number | null;
  notes: string | null;
  activities: ActivityLog[];
  table: {
    number: number;
  };
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
  const [restaurant, setRestaurant] = useState<any>(null);
  const [tables, setTables] = useState<Table[]>([]);

  const [display, setDisplay] = useState<string>("floormap");

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
      setDisplay(initialDisplay);
    }
  }, []);

  // Listen for URL changes when in admin view
  useEffect(() => {
    if (isAdminView) {
      const handleUrlChange = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const currentTab = urlParams.get("tab");
        if (
          currentTab &&
          [
            "floormap",
            "menu",
            "menu-management",
            "employees",
            "activity",
          ].includes(currentTab)
        ) {
          setDisplay(currentTab);
        }
      };

      // Check URL on mount and when URL changes
      handleUrlChange();
      window.addEventListener("popstate", handleUrlChange);
      return () => window.removeEventListener("popstate", handleUrlChange);
    }
  }, [isAdminView]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const adminSetDisplay = async (newDisplay: string) => {
    try {
      await checkAdmin();
      setDisplay(newDisplay);
    } catch (error) {
      console.error("Unauthorized action");
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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await deleteRestaurant(restaurantId);
        router.push(isAdminView ? "/admin/restaurants" : "/restaurants");
      } catch (error) {
        console.error("Failed to delete restaurant:", error);
      }
    }
  };

  const handleTableSelect = (tableId: number) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      setSelectedTable(table);
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
        ) : display === "employees" && isAdminView ? (
          <StaffPage />
        ) : display === "floormap" ? (
          <Floormap
            tables={tables}
            onTableSelect={handleTableSelect}
            isAdminView={isAdminView}
            restaurantId={restaurantId}
            restaurantName={restaurant.name}
            display={display}
            setDisplay={setDisplay}
            adminSetDisplay={adminSetDisplay}
          />
        ) : display === "menu" && isAdminView ? (
          <MenuPage restaurantId={restaurantId} />
        ) : display === "menu-management" && isAdminView ? (
          <MenuPage
            restaurantId={restaurantId}
            onBack={() => adminSetDisplay("floormap")}
          />
        ) : display === "activity" ? (
          <ActivityLogPage
            restaurantId={restaurantId}
            isAdminView={isAdminView}
            setDisplay={setDisplay}
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
    </div>
  );
}
