"use client";

import { useState, useCallback, use } from "react";
import { Table, MenuItem, Order } from "@/app/types";
import { useRouter } from "next/navigation";

// Move static data outside component
const categories: MenuItem["category"][] = [
  "appetizer",
  "main",
  "beverage",
  "dessert",
];

const menuItems: MenuItem[] = [
  // Appetizers
  {
    id: 1,
    name: "Caesar Salad",
    price: 12.99,
    category: "appetizer",
    description: "Fresh romaine lettuce with caesar dressing and croutons",
  },
  {
    id: 2,
    name: "Bruschetta",
    price: 9.99,
    category: "appetizer",
    description: "Toasted bread with tomatoes, garlic, and basil",
  },
  // Main Courses
  {
    id: 3,
    name: "Margherita Pizza",
    price: 18.99,
    category: "main",
    description: "Classic tomato and mozzarella pizza with fresh basil",
  },
  {
    id: 4,
    name: "Grilled Salmon",
    price: 24.99,
    category: "main",
    description: "Fresh salmon with lemon butter sauce",
  },
  // Beverages
  {
    id: 5,
    name: "House Wine",
    price: 8.99,
    category: "beverage",
    description: "Red or white wine",
  },
  {
    id: 6,
    name: "Craft Beer",
    price: 6.99,
    category: "beverage",
    description: "Selection of local craft beers",
  },
  // Desserts
  {
    id: 7,
    name: "Tiramisu",
    price: 8.99,
    category: "dessert",
    description: "Classic Italian coffee-flavored dessert",
  },
  {
    id: 8,
    name: "Chocolate Cake",
    price: 7.99,
    category: "dessert",
    description: "Rich chocolate layer cake",
  },
];

export default function TableManagement({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<MenuItem["category"]>("appetizer");
  const { id } = use(params);
  const addOrder = useCallback(
    (menuItem: MenuItem) => {
      const existingOrder = orders.find(
        (order) => order.menuItem.id === menuItem.id
      );

      if (existingOrder) {
        setOrders((prev) =>
          prev.map((order) =>
            order.menuItem.id === menuItem.id
              ? { ...order, quantity: order.quantity + 1 }
              : order
          )
        );
      } else {
        const newOrder: Order = {
          id: Date.now(),
          menuItem,
          quantity: 1,
          status: "pending",
        };
        setOrders((prev) => [...prev, newOrder]);
      }
    },
    [orders]
  );

  const removeOrder = useCallback((orderId: number) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  }, []);

  const updateQuantity = useCallback((orderId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, quantity: newQuantity } : order
      )
    );
  }, []);

  const filteredMenuItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  const totalAmount = orders.reduce(
    (sum, order) => sum + order.menuItem.price * order.quantity,
    0
  );

  const handleBackClick = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="p-8">
      <button
        onClick={handleBackClick}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Floor Plan
      </button>

      <h1 className="text-3xl font-bold mb-8">Table {id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Menu Categories */}
        <div className="md:col-span-2">
          <div className="flex gap-4 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => addOrder(item)}
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">{item.name}</h3>
                  <span>${item.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Current Order</h2>
          <div className="space-y-4 mb-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-2 bg-white rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-bold">{order.menuItem.name}</h3>
                  <p className="text-gray-600">
                    ${order.menuItem.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(order.id, order.quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{order.quantity}</span>
                  <button
                    onClick={() => updateQuantity(order.id, order.quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeOrder(order.id)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
