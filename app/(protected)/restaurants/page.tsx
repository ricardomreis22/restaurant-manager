"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRestaurants } from "@/actions/restaurants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getRestaurants();
        if (data?.restaurants) {
          setRestaurants(data.restaurants);
        }
      } catch (error) {
        console.error("Failed to load restaurants:", error);
      }
    };

    loadRestaurants();
  }, []);

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Restaurants</h1>
        <div className="flex gap-2">
          <>
            <Button onClick={() => router.push("/restaurants/newrestaurant")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </>
        </div>
      </div>

      {!restaurants?.length ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            You haven't created any restaurants yet.
          </p>
          <Link href="/restaurants/newrestaurant">
            <Button variant="outline">Create your first restaurant</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="border p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <Link href={`/restaurants/${restaurant.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                    <p className="text-gray-600">{restaurant.address}</p>
                    {restaurant.phone && (
                      <p className="text-gray-600">{restaurant.phone}</p>
                    )}
                    {restaurant.email && (
                      <p className="text-gray-600">{restaurant.email}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
