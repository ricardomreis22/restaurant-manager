"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRestaurants, deleteRestaurant } from "@/actions/restaurants";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { Restaurant } from "@prisma/client";

export default function AdminRestaurantsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // Redirect if not admin
    if (session?.user?.userRole !== "ADMIN") {
      router.push("/restaurants");
      return;
    }

    const loadRestaurants = async () => {
      try {
        const data = await getRestaurants();
        if (data?.restaurants) {
          setRestaurants(data.restaurants);
        }
      } catch (error) {
        console.error("Failed to load restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [status, session, router]);

  const handleDeleteRestaurant = async (
    restaurantId: number,
    restaurantName: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(restaurantId);
    try {
      await deleteRestaurant(restaurantId);
      // Remove the restaurant from the local state
      setRestaurants(restaurants.filter((r) => r.id !== restaurantId));
    } catch (error) {
      console.error("Failed to delete restaurant:", error);
      alert("Failed to delete restaurant. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading || status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="flex justify-center items-center mt-4 mb-16 sm:mb-24 text-2xl sm:text-3xl font-bold">
        Restaurant Administration
      </h1>

      <div className="grid sm:grid-cols-2 gap-4 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="border p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
            onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
          >
            {/* Header */}
            <div className="flex justify-between items-center min-w-0 mb-10">
              <h2 className="flex text-lg sm:text-xl font-semibold justify-center flex-1">
                {restaurant.name}
              </h2>
              {/* Action Buttons - Only keep delete */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when deleting
                    handleDeleteRestaurant(restaurant.id, restaurant.name);
                  }}
                  disabled={deleting === restaurant.id}
                  className="flex-shrink-0"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
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

      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 ">
        <Button
          variant="ghost"
          onClick={() => router.push("/restaurants")}
          className=" border border-white border-1 transform transition-transform duration-200 hover:scale-110 shadow-lg "
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 " />
          <span className="hidden group-hover:inline sm:inline">
            Back to Restaurant
          </span>
        </Button>
        <Button
          onClick={() => router.push("/restaurants/newrestaurant")}
          className="transform transition-transform duration-200 hover:scale-110 shadow-lg"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden group-hover:inline ml-2 sm:inline">
            Add Restaurant
          </span>
        </Button>
      </div>
    </div>
  );
}
