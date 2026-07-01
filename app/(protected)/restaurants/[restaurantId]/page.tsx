"use client";

import { Suspense } from "react";
import RestaurantView from "@/components/restaurants/RestaurantView";

export default function RestaurantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">Loading...</div>
      }
    >
      <RestaurantView isAdminView={false} />
    </Suspense>
  );
}
