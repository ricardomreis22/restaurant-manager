"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRestaurant, getRestaurantTables } from "../actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";
import { deleteRestaurant } from "../actions";
import Floormap from "@/components/restaurants/FloorMap";
import StaffPage from "@/components/restaurants/StaffPage";
import MenuPage from "@/components/restaurants/MenuPage";
import { TableView } from "@/components/restaurants/TableView";

interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
}

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [display, setDisplay] = useState<string>("floormap");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

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
        router.push("/restaurants");
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
            <h1 className="text-xl font-semibold">{restaurant.name}</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setDisplay("floormap")}
                variant={display === "floormap" ? "default" : "outline"}
              >
                Floor Map
              </Button>
              <Button
                onClick={() => setDisplay("menu")}
                variant={display === "menu" ? "default" : "outline"}
              >
                Menu
              </Button>
              <Button
                onClick={() => setDisplay("employees")}
                variant={display === "employees" ? "default" : "outline"}
              >
                Employees
              </Button>
            </div>
          </div>

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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTable ? (
          <TableView
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
          />
        ) : display === "employees" ? (
          <StaffPage />
        ) : display === "floormap" ? (
          <Floormap tables={tables} onTableSelect={handleTableSelect} />
        ) : display === "menu" ? (
          <MenuPage restaurantId={restaurantId} />
        ) : null}
      </div>
    </div>
  );
}
