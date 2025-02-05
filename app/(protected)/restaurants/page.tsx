import React from "react";
import { getRestaurants } from "@/app/(protected)/restaurants/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Restaurant } from "@prisma/client";

const RestaurantsPage = async () => {
  const userRestaurants = await getRestaurants();
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Restaurants</h1>
        <Link href="/restaurants/newrestaurant">
          <Button>Create a Restaurant</Button>
        </Link>
      </div>

      {!userRestaurants?.restaurants.length ? (
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
          {userRestaurants.restaurants.map((restaurant) => (
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
};

export default RestaurantsPage;
