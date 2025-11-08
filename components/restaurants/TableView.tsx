"use client";

import { useState, useEffect, startTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuItems, Category } from "@prisma/client";
import { getCategories, getMenuItems } from "@/actions/menu";
import { createOrder, getTableOrders } from "@/actions/orders";
import { ArrowLeft, Clock, CreditCard, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FoodModal } from "./FoodModal";
import { toggleTableLock } from "@/actions/tables";

interface TableViewProps {
  table: {
    id: number;
    number: number;
    capacity: number;
    isReserved: boolean;
    isLocked: boolean;
  };
  restaurantId: number;
  onClose: () => void;
}

interface MenuItemWithCategory extends MenuItems {
  category: Category;
}

interface OrderItem {
  id: string;
  menuItemId: number;
  name: string;
  price: number;
  description: string | null;
  categoryId: number;
  restaurantId: number;
  hasSpicyOption: boolean;
  hasSidesOption: boolean;
  notes: string | null;
  category: Category;
  quantity: number;
  spicyLevel: string | null;
  sides: string | null;
  orderNotes: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
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
    spicyLevel: string | null;
    sides: string | null;
    notes: string | null;
  }[];
}

export function TableView({ table, restaurantId, onClose }: TableViewProps) {
  const router = useRouter();
  const isFirstRender = useRef(true);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItemWithCategory | null>(
    null
  );
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<
    number | null
  >(null);

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
  }, [restaurantId, table.id, onClose]);

  // Unlock table when leaving the view
  useEffect(() => {
    // Skip cleanup on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return () => {
      // This cleanup function runs when the component unmounts
      if (table.isLocked) {
        toggleTableLock(table.id, false).catch((error) => {
          console.error("Failed to unlock table:", error);
        });
      }
    };
  }, [table.id, table.isLocked]);

  // Also unlock when explicitly closing the view
  const handleClose = async () => {
    if (table.isLocked) {
      try {
        await toggleTableLock(table.id, false);
      } catch (error) {
        console.error("Failed to unlock table:", error);
      }
    }
    onClose();
  };

  const handleAddToOrder = (item: MenuItemWithCategory) => {
    setSelectedItem(item);
    setIsFoodModalOpen(true);
  };

  const handleFoodModalSubmit = (data: {
    spicyLevel?: string;
    sides?: string;
    notes?: string;
  }) => {
    if (!selectedItem) return;

    setOrder((currentOrder) => {
      const existingItem = currentOrder.find(
        (orderItem) =>
          orderItem.menuItemId === selectedItem.id &&
          orderItem.spicyLevel === data.spicyLevel &&
          orderItem.sides === data.sides &&
          orderItem.orderNotes === data.notes
      );

      if (existingItem) {
        return currentOrder.map((orderItem) =>
          orderItem.id === existingItem.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }

      const newOrderItem: OrderItem = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        description: selectedItem.description,
        categoryId: selectedItem.categoryId,
        restaurantId: selectedItem.restaurantId,
        hasSpicyOption: selectedItem.hasSpicyOption,
        hasSidesOption: selectedItem.hasSidesOption,
        notes: null,
        category: selectedItem.category,
        quantity: 1,
        spicyLevel: data.spicyLevel || null,
        sides: data.sides || null,
        orderNotes: data.notes || null,
        imageUrl: selectedItem.imageUrl,
        isAvailable: selectedItem.isAvailable,
      };

      return [...currentOrder, newOrderItem];
    });

    setSelectedItem(null);
    setIsFoodModalOpen(false);
  };

  const removeFromOrder = (orderItemId: string) => {
    setOrder((currentOrder) =>
      currentOrder
        .map((item) =>
          item.id === orderItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
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
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          spicyLevel: item.spicyLevel || undefined,
          sides: item.sides || undefined,
          notes: item.orderNotes || undefined,
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
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Menu Items (Left Side) - Hidden on small screens unless menu is open */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-1/2 lg:w-2/3 xl:w-3/4 py-12 px-8 overflow-y-auto bg-[rgba(36,49,52,255)] bg-opacity-80  md:bg-white md:bg-opacity-100 md:bg-transparent
          absolute md:relative top-0 left-0 right-0 bottom-0 z-10 md:z-auto h-screen md:h-full`}
        >
          {/* Category Tabs - Hidden on small screens */}
          <div className="flex just ify-between items-center mb-16 ">
            <div className="hidden md:flex gap-2 overflow-x-auto pb-2  ">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-black"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories List - Only visible on small screens */}
          {selectedMobileCategory === null ? (
            <div className="block md:hidden mb-6 mt-10 ">
              <h3 className="text-xl font-semibold text-white mb-4">
                Categories
              </h3>
              <div className="space-y-2 border-b-2 border-white pb-6">
                {categories
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white hover:text-black transition-colors"
                      onClick={() => {
                        setSelectedMobileCategory(category.id);
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
              </div>

              {/* All Menu Items - Only visible when no category is selected */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  All Menu Items
                </h3>
                <div className="space-y-2">
                  {menuItems
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-white bg-opacity-10 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-20 transition-colors"
                        onClick={() => {
                          handleAddToOrder(item);
                          setIsMenuOpen(false);
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-white">
                            {item.name}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-gray-300 mt-1">
                              {item.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {item.category.name}
                          </p>
                        </div>
                        <p className="font-medium text-white ml-4">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Category Items View - Only visible on small screens when category is selected */
            <div className="block md:hidden mb-6 mt-10">
              {/* Back button and category title */}
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:text-black transition-colors"
                  onClick={() => {
                    setSelectedMobileCategory(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {categories.find((c) => c.id === selectedMobileCategory)?.name}{" "}
              </h3>
              <div className="space-y-2">
                {menuItems
                  .filter((item) => item.categoryId === selectedMobileCategory)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-white bg-opacity-10 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-20 transition-colors"
                      onClick={() => {
                        handleAddToOrder(item);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-300 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-white ml-4">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Menu Items Grid - Hidden on small screens */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 cursor-pointer hover:shadow-md transition"
                onClick={() => {
                  handleAddToOrder(item);
                  // Close menu on mobile after selecting an item
                  setIsMenuOpen(false);
                }}
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

        {/* Orders (Right Side) - Full width on small screens */}
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 md:border-l overflow-hidden flex flex-col text-white">
          {/* Hamburger Menu Button - Only visible on small screens */}
          <div className="flex justify-between items-center p-4 md:hidden z-50 border-b-2 border-white bg-[rgba(36,49,52,1)]">
            <Button
              variant="ghost"
              size="sm"
              className=" hover:bg-white hover:text-black transition-colors"
              onClick={handleClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold ">Table {table.number}</h2>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Current Order */}
          <div className=" p-10 border-b-2 border-white md:mt-0 md:mb-0 md:border md:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Current Order
            </h3>
            {order.length === 0 ? (
              <p className="text-gray-400">No items in order</p>
            ) : (
              <div className="space-y-4">
                {order.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 rounded-lg shadow-sm md:border md:border-gray-600"
                  >
                    <div>
                      <h4 className="font-medium text-white">{item.name}</h4>
                      {(item.spicyLevel || item.sides || item.orderNotes) && (
                        <div className="text-sm text-gray-300 mt-1">
                          {item.spicyLevel && (
                            <p>Spicy Level: {item.spicyLevel}</p>
                          )}
                          {item.sides && <p>Sides: {item.sides}</p>}
                          {item.orderNotes && <p>Notes: {item.orderNotes}</p>}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromOrder(item.id)}
                        >
                          -
                        </Button>
                        <span className="text-sm text-white">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOrder((currentOrder) =>
                              currentOrder.map((orderItem) =>
                                orderItem.id === item.id
                                  ? {
                                      ...orderItem,
                                      quantity: orderItem.quantity + 1,
                                    }
                                  : orderItem
                              )
                            );
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="md:border-t md:border-gray-600 pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg text-white">
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
              <h3 className="text-xl font-semibold text-white">
                Placed Orders
              </h3>
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
                <p className="text-gray-400">No orders placed yet</p>
              ) : (
                placedOrders.map((placedOrder) => (
                  <Card key={placedOrder.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {placedOrder.orderNumber}
                        </p>
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
                        <div key={index} className="flex flex-col text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-900">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="text-gray-600">
                              $
                              {(item.menuItem.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {(item.spicyLevel || item.sides || item.notes) && (
                            <div className="text-gray-500 text-xs mt-1">
                              {item.spicyLevel && (
                                <p>Spicy Level: {item.spicyLevel}</p>
                              )}
                              {item.sides && <p>Sides: {item.sides}</p>}
                              {item.notes && <p>Notes: {item.notes}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="md:border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium text-gray-900">
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

      {selectedItem && (
        <FoodModal
          isOpen={isFoodModalOpen}
          onClose={() => {
            setIsFoodModalOpen(false);
            setSelectedItem(null);
          }}
          onSubmit={handleFoodModalSubmit}
          menuItem={selectedItem}
        />
      )}
    </div>
  );
}
