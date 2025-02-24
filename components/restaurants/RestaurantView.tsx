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
import { MoreVertical, Trash, ArrowLeft, Settings } from "lucide-react";
import Floormap from "@/components/restaurants/FloorMap";
import StaffPage from "@/components/restaurants/StaffPage";
import MenuPage from "@/components/restaurants/MenuPage";
import { TableView } from "@/components/restaurants/TableView";
import { useCurrentRole } from "@/hooks/use-current-role";
import { checkAdmin } from "@/actions/admin";
interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
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
      {/* Top Navigation */}
      <div className="border-b">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {isAdminView ? "Admin: " : ""}
              {restaurant.name}
            </h1>
            {isAdminView && (
              <div className="flex gap-2">
                <Button
                  onClick={() => adminSetDisplay("floormap")}
                  variant={display === "floormap" ? "default" : "outline"}
                >
                  Floor Map
                </Button>

                <>
                  <Button
                    onClick={() => adminSetDisplay("menu")}
                    variant={display === "menu" ? "default" : "outline"}
                  >
                    Menu
                  </Button>
                  <Button
                    onClick={() => adminSetDisplay("employees")}
                    variant={display === "employees" ? "default" : "outline"}
                  >
                    Employees
                  </Button>
                </>
              </div>
            )}
          </div>
          <div>
            {userRole === "ADMIN" && !isAdminView && (
              <Button
                onClick={() =>
                  router.push(`/admin/restaurants/${restaurantId}`)
                }
                variant="outline"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin View
              </Button>
            )}
            {userRole === "ADMIN" && isAdminView && (
              <Button
                onClick={() => router.push(`/restaurants/${restaurantId}`)}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Restaurant View
              </Button>
            )}
            {isAdminView && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleDelete}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Restaurant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

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
          />
        ) : display === "menu" && isAdminView ? (
          <MenuPage restaurantId={restaurantId} />
        ) : null}
      </div>
    </div>
  );
}
