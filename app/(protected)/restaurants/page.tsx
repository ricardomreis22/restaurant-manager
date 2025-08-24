"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRestaurants } from "@/actions/restaurants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Mail, MapPin, Phone, Plus, Settings } from "lucide-react";

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setIsLoading(true);
        const data = await getRestaurants();
        if (data?.restaurants) {
          setRestaurants(data.restaurants);
        }
      } catch (error) {
        console.error("Failed to load restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center gap-4 mb-8 justify-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-10">My Restaurants</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Loading restaurants...</p>
        </div>
      ) : !restaurants?.length ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            You haven't created any restaurants yet.
          </p>
          <Link href="/restaurants/newrestaurant">
            <Button variant="outline">Create your first restaurant</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="border p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/restaurants/${restaurant.id}`)}
            >
              {/* Header */}
              <div className="flex justify-between items-center min-w-0 mb-10">
                <h2 className="flex text-lg sm:text-xl font-semibold justify-center flex-1">
                  {restaurant.name}
                </h2>
              </div>

              <div className="flex flex-col gap-4 mb-5">
                {/* Contact Info */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <p className="text-sm sm:text-base flex gap-2">
                      {restaurant.address}
                    </p>
                  </div>
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <p className="text-sm sm:text-base flex gap-2">
                        {restaurant.phone}
                      </p>
                    </div>
                  )}
                  {restaurant.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-500" />
                      <p className="text-sm sm:text-base flex gap-2">
                        {restaurant.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        <>
          <Button
            onClick={() => router.push("/admin/restaurants")}
            variant="outline"
            className="transform transition-transform duration-200 hover:scale-110 sm:gap-2 group shadow-lg text-black"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Dashboard</span>
          </Button>
          <Button
            onClick={() => router.push("/restaurants/newrestaurant")}
            className="transform transition-transform duration-200 hover:scale-110 sm:gap-2 group shadow-lg"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden ml-2 sm:inline">Add Restaurant</span>
          </Button>
        </>
      </div>
    </div>
  );
}
