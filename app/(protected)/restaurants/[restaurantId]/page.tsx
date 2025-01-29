"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRestaurant, getRestaurantMenu } from "../[restaurantId]/actions";
import { getRestaurantTables } from "./actions";
import { Button } from "@/components/ui/button";
import { Menu } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash } from "lucide-react";
import { deleteRestaurant } from "../actions";
import EmployeesPage from "@/components/restaurants/EmployeesPage";
import Floormap from "@/components/restaurants/FloorMap";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Menu;
  description: string;
  isAvailable: boolean;
}

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [display, setDisplay] = useState<string>("floormap");
  useEffect(() => {
    const loadData = async () => {
      const restaurantData = await getRestaurant(restaurantId);
      const tablesData = await getRestaurantTables(restaurantId);
      const menuData = await getRestaurantMenu(restaurantId);
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

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  //const filteredMenuItems = menuItems.filter(
  //  (item) => item.category === selectedCategory
  //);

  return (
    <div className="h-screen flex">
      <div className="w-2/3 h-full p-8">
        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <Button
              onClick={() => setDisplay("floormap")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              FloorMap{" "}
            </Button>
            <Button
              onClick={() => router.push(`/restaurants/${restaurantId}/menu`)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Set Up Menu
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setDisplay("employees")}
            >
              Employees
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
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

        {display === "employees" ? (
          <EmployeesPage />
        ) : display === "floormap" ? (
          <Floormap tables={tables} />
        ) : null}
      </div>
      {/* Right side - Menu and Orders */}
    </div>
  );
}
