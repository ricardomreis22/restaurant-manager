"use client";

import { useState, useEffect } from "react";
import {
  createMenuItem,
  getMenu,
  updateMenuItem,
  deleteMenuItem,
} from "@/app/(protected)/restaurants/actions";
import { MenuItem } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AddMenuItemModal } from "./AddMenuItemModal";
import { UpdateMenuItemModal } from "./UpdateMenuItemModal";
import { Pencil, Trash } from "lucide-react";

interface MenuPageProps {
  restaurantId: number;
}

export default function MenuPage({ restaurantId }: MenuPageProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const loadMenu = async () => {
    try {
      const menuData = await getMenu(restaurantId);
      setMenuItems(menuData);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [restaurantId]);

  const handleAddItem = async (item: {
    name: string;
    description: string;
    price: number;
    category: string;
  }) => {
    try {
      await createMenuItem(restaurantId, item);
      loadMenu();
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleUpdateItem = async (
    id: number,
    item: {
      name: string;
      description: string;
      price: number;
      category: string;
    }
  ) => {
    try {
      await updateMenuItem(id, item);
      loadMenu();
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem(id);
        loadMenu();
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading menu...</div>;
  }

  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Menu</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Menu Item</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <h3 className="text-xl font-semibold">{category}</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-medium">${item.price}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsUpdateModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
      />

      {selectedItem && (
        <UpdateMenuItemModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdateItem}
          item={selectedItem}
        />
      )}
    </div>
  );
}
