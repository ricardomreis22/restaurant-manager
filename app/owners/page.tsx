"use client";

import { useState, useEffect } from "react";
import { getOwners, createOwner, updateOwner, deleteOwner } from "./actions";

interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const data = await getOwners();
      setOwners(data);
    } catch (error) {
      console.error("Error fetching owners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateOwner(editingId, formData);
      } else {
        await createOwner(formData);
      }

      // Reset form and refresh data
      setFormData({ name: "", email: "", phone: "" });
      setEditingId(null);
      fetchOwners();
    } catch (error) {
      console.error("Error saving owner:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this owner?")) return;

    try {
      await deleteOwner(id);
      fetchOwners();
    } catch (error) {
      console.error("Error deleting owner:", error);
    }
  };

  const handleEdit = (owner: Owner) => {
    setFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
    });
    setEditingId(owner.id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Owners</h1>

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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? "Update Owner" : "Add Owner"}
        </button>
      </form>

      {/* Owners List */}
      <div className="grid gap-4">
        {owners.map((owner) => (
          <div
            key={owner.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{owner.name}</h3>
              <p className="text-gray-600">{owner.email}</p>
              <p className="text-gray-600">{owner.phone}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(owner)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(owner.id)}
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
