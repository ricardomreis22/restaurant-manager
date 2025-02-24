"use client";

import { useState, useEffect, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuItems, Category } from "@prisma/client";
import { getCategories, getMenuItems } from "@/actions/menu";
import { createOrder, getTableOrders, payOrder } from "@/actions/orders";
import { ArrowLeft, Clock, CreditCard, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TableViewProps {
  table: {
    id: number;
    number: number;
    capacity: number;
    isReserved: boolean;
  };
  restaurantId: number;
  onClose: () => void;
}

interface MenuItemWithCategory extends MenuItems {
  category: Category;
}

interface OrderItem extends MenuItemWithCategory {
  quantity: number;
}

interface PlacedOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: {
    quantity: number;
    menuItem: MenuItems;
  }[];
}

export function TableView({ table, restaurantId, onClose }: TableViewProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, menuItemsData, ordersData] = await Promise.all([
          getCategories(restaurantId),
          getMenuItems(restaurantId),
          getTableOrders(table.id),
        ]);
        setCategories(categoriesData);
        setMenuItems(menuItemsData as MenuItemWithCategory[]);
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
        if (ordersData.success) {
          setPlacedOrders(ordersData.orders);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId, table.id]);

  const addToOrder = (item: MenuItemWithCategory) => {
    setOrder((currentOrder) => {
      const existingItem = currentOrder.find(
        (orderItem) => orderItem.id === item.id
      );

      if (existingItem) {
        return currentOrder.map((orderItem) =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }

      return [...currentOrder, { ...item, quantity: 1 }];
    });
  };

  const removeFromOrder = (itemId: number) => {
    setOrder((currentOrder) =>
      currentOrder
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    if (order.length === 0) return;

    setIsPlacingOrder(true);
    startTransition(() => {
      createOrder({
        tableId: table.id,
        items: order.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        totalAmount: calculateTotal(),
      })
        .then(async (response) => {
          if (response.success) {
            toast.success("Order placed successfully!");
            // Clear the current order
            setOrder([]);
            // Refresh placed orders
            const ordersData = await getTableOrders(table.id);
            if (ordersData.success) {
              setPlacedOrders(ordersData.orders);
            }
            router.refresh();
          }
        })
        .catch((error) => {
          console.error("Failed to place order:", error);
          toast.error("Failed to place order. Please try again.");
        })
        .finally(() => {
          setIsPlacingOrder(false);
        });
    });
  };

  const handlePayOrder = (orderId: number) => {
    setIsProcessingPayment(true);
    startTransition(() => {
      payOrder(orderId)
        .then(async (response) => {
          if (response.success) {
            toast.success("Payment processed successfully!");
            // Refresh placed orders
            const ordersData = await getTableOrders(table.id);
            if (ordersData.success) {
              setPlacedOrders(ordersData.orders);
            }
            router.refresh();
          }
        })
        .catch((error) => {
          console.error("Failed to process payment:", error);
          toast.error("Failed to process payment. Please try again.");
        })
        .finally(() => {
          setIsProcessingPayment(false);
        });
    });
  };

  const calculateTotalAmount = (orders: PlacedOrder[]) => {
    return orders
      .filter((order) => order.status === "Pending")
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div>Loading menu...</div>;
  }

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.categoryId === selectedCategory)
    : menuItems;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-bold">Table {table.number}</h2>
          </div>
          <div className="text-sm text-gray-500">
            <p>Capacity: {table.capacity}</p>
            <p>Status: {table.isReserved ? "Reserved" : "Available"}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Menu Items (Left Side) */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:shadow-md transition"
                onClick={() => addToOrder(item)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Orders (Right Side) */}
        <div className="w-1/3 border-l bg-gray-50 overflow-hidden flex flex-col">
          {/* Current Order */}
          <div className="p-6 border-b bg-white">
            <h3 className="text-xl font-semibold mb-4">Current Order</h3>
            {order.length === 0 ? (
              <p className="text-gray-500">No items in order</p>
            ) : (
              <div className="space-y-4">
                {order.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 bg-gray-50 rounded-lg shadow-sm"
                  >
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromOrder(item.id)}
                        >
                          -
                        </Button>
                        <span className="text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToOrder(item)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={order.length === 0 || isPlacingOrder}
                >
                  {isPlacingOrder ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            )}
          </div>

          {/* Placed Orders */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Placed Orders</h3>
              {placedOrders.some((order) => order.status === "Pending") && (
                <Button
                  onClick={() =>
                    router.push(
                      `/restaurants/${restaurantId}/tables/${table.id}/payment`
                    )
                  }
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay All Orders
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {placedOrders.length === 0 ? (
                <p className="text-gray-500">No orders placed yet</p>
              ) : (
                placedOrders.map((placedOrder) => (
                  <Card key={placedOrder.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{placedOrder.orderNumber}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatDate(placedOrder.createdAt)}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                          placedOrder.status
                        )}`}
                      >
                        {placedOrder.status}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {placedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="text-gray-600">
                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>${placedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
