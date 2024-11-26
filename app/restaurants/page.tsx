"use client";

import { useState, useEffect } from "react";
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "./actions";
import { getOwners } from "../owners/actions";

interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  ownerId: number;
  owner: {
    name: string;
  };
}

interface Owner {
  id: number;
  name: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    ownerId: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRestaurants();
    fetchOwners();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const data = await getOwners();
      setOwners(data);
      if (data.length > 0 && !formData.ownerId) {
        setFormData((prev) => ({ ...prev, ownerId: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateRestaurant(editingId, formData);
      } else {
        await createRestaurant(formData);
      }

      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        ownerId: owners[0]?.id || 0,
      });
      setEditingId(null);
      fetchRestaurants();
    } catch (error) {
      console.error("Error saving restaurant:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;

    try {
      await deleteRestaurant(id);
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      ownerId: restaurant.ownerId,
    });
    setEditingId(restaurant.id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Restaurants</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Owner</label>
          <select
            value={formData.ownerId}
            onChange={(e) =>
              setFormData({ ...formData, ownerId: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
            required
          >
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? "Update Restaurant" : "Add Restaurant"}
        </button>
      </form>

      {/* Restaurants List */}
      <div className="grid gap-4">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{restaurant.name}</h3>
              <p className="text-gray-600">{restaurant.address}</p>
              <p className="text-gray-600">{restaurant.phone}</p>
              <p className="text-gray-600">{restaurant.email}</p>
              <p className="text-gray-600">Owner: {restaurant.owner.name}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(restaurant)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(restaurant.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
