"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getRestaurant } from "@/actions/restaurants";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const restaurantId = parseInt(params.restaurantId as string);

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

  return (
    <div>
      <nav className="hidden sm:flex p-4 justify-between items-center bg-[rgba(36,49,52,255)] text-white">
        <div className="flex items-center gap-4">
          <img src="/favicon.ico" alt="logo" className="w-15 h-12" />
        </div>
        {restaurantName && (
          <h1 className="text-xl font-semibold">{restaurantName}</h1>
        )}
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
