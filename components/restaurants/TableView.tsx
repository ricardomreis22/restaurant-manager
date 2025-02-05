"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuItem } from "@prisma/client";

interface TableViewProps {
  table: {
    id: number;
    number: number;
    capacity: number;
    isReserved: boolean;
  };
  onClose: () => void;
}

export function TableView({ table, onClose }: TableViewProps) {
  const [order, setOrder] = useState<MenuItem[]>([]);

  return (
    <div className="h-full flex">
      {/* Menu Items (Left Side) */}
      <div className="w-2/3 p-6 border-r overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Menu Items</h2>
          <Button variant="outline" onClick={onClose}>
            Back to Floor Map
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Sample menu items - replace with actual menu items */}
          {[1, 2, 3].map((category) => (
            <Card key={category} className="p-4">
              <h3 className="font-semibold mb-3">Category {category}</h3>
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => {
                      // Add item to order
                    }}
                  >
                    <div>
                      <h4 className="font-medium">Item {item}</h4>
                      <p className="text-sm text-gray-600">Description</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$10.00</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Order Details (Right Side) */}
      <div className="w-1/3 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Table {table.number}</h2>
          <p className="text-gray-600">Capacity: {table.capacity}</p>
          <p className="text-gray-600">
            Status: {table.isReserved ? "Reserved" : "Available"}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Current Order</h3>
          {order.length === 0 ? (
            <p className="text-gray-500">No items in order</p>
          ) : (
            <div className="space-y-2">
              {order.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${item.price}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Remove item from order
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    $
                    {order
                      .reduce((sum, item) => sum + item.price, 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              <Button className="w-full mt-4">Place Order</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
