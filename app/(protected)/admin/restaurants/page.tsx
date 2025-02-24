"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRestaurants } from "@/actions/restaurants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash, Users, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminRestaurantsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading || status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/restaurants")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Restaurant View
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Restaurant Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all restaurants in the system
          </p>
        </div>
        <Button onClick={() => router.push("/restaurants/newrestaurant")}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Restaurant
        </Button>
      </div>

      <div className="grid gap-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="border rounded-lg p-6 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{restaurant.name}</h2>
                <div className="mt-2 space-y-1 text-gray-600">
                  <p>{restaurant.address}</p>
                  {restaurant.phone && <p>Phone: {restaurant.phone}</p>}
                  {restaurant.email && <p>Email: {restaurant.email}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/restaurants/${restaurant.id}/staff`)
                  }
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Staff
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/restaurants/${restaurant.id}`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this restaurant?"
                      )
                    ) {
                      // Add delete functionality
                    }
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="border rounded p-3">
                <p className="font-medium">Total Staff</p>
                <p className="text-2xl mt-1">{restaurant.users?.length || 0}</p>
              </div>
              <div className="border rounded p-3">
                <p className="font-medium">Total Tables</p>
                <p className="text-2xl mt-1">
                  {restaurant.tables?.length || 0}
                </p>
              </div>
              <div className="border rounded p-3">
                <p className="font-medium">Menu Items</p>
                <p className="text-2xl mt-1">
                  {restaurant.menuItems?.length || 0}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/admin/restaurants/${restaurant.id}/menu`)
                }
              >
                Manage Menu
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/admin/restaurants/${restaurant.id}/tables`)
                }
              >
                Manage Tables
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/restaurants/${restaurant.id}`)}
              >
                View Restaurant
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
