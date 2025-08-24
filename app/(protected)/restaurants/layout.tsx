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

  return <div className="h-full">{children}</div>;
}
