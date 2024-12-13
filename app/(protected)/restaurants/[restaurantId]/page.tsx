"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { getRestaurantMenu } from "../[restaurantId]/actions";
import { getRestaurant } from "../actions";
import { getRestaurantTables } from "./actions";
import { Button } from "@/components/ui/button";
import { Menu } from "@prisma/client";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Menu;
  description: string;
  isAvailable: boolean;
}

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const router = useRouter();
  const { restaurantId } = use(params);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const restaurantData = await getRestaurant(parseInt(restaurantId));
      const tablesData = await getRestaurantTables(parseInt(restaurantId));
      const menuData = await getRestaurantMenu(parseInt(restaurantId));

      setRestaurant(restaurantData);
      setTables(tablesData);
    };

    loadData();
  }, [restaurantId]);

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  //const filteredMenuItems = menuItems.filter(
  //  (item) => item.category === selectedCategory
  //);

  return (
    <div className="h-screen flex">
      <div className="w-2/3 h-full p-8">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => router.push(`/restaurants/${restaurantId}/menu`)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Set Up Menu
          </Button>
        </div>

        <div className="relative h-full bg-gray-50 rounded-lg">
          {/* Kitchen - Left Side */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-48 bg-gray-200 rounded-r-lg flex items-center justify-center">
            <span className="font-semibold text-gray-700 -rotate-90">
              Kitchen
            </span>
          </div>

          {/* Entrance - Right Side */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-32 flex flex-col items-center justify-center">
            <div className="w-12 h-20 border-2 border-gray-400 rounded-r-lg"></div>
            <span className="mt-2 text-sm text-gray-700">Entrance</span>
          </div>

          {/* Tables Grid */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`
                    p-4 rounded-lg shadow-md text-center cursor-pointer
                    ${table.isReserved ? "bg-yellow-100" : "bg-green-100"}
                    ${selectedTable === table.id ? "ring-2 ring-blue-500" : ""}
                    hover:shadow-lg transition-all
                  `}
                >
                  <h3 className="font-bold text-lg">Table {table.number}</h3>
                  <p className="text-sm text-gray-600">
                    Capacity: {table.capacity}
                  </p>
                  <p className="text-sm mt-1">
                    {table.isReserved ? "Reserved" : "Available"}
                  </p>
                  {table.reservations && table.reservations.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Next Reservation:</p>
                      <p>
                        {new Date(
                          table.reservations[0].time
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bar - Bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="font-semibold text-gray-700">Bar</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span>Reserved</span>
          </div>
        </div>
      </div>

      {/* Right side - Menu and Orders */}
    </div>
  );
}
