"use client";

import { useState, useEffect, startTransition, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuItems, Category } from "@prisma/client";
import { getCategories, getMenuItems } from "@/actions/menu";
import { createOrder, getTableOrders } from "@/actions/orders";
import { ArrowLeft, Clock, CreditCard, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FoodModal } from "./FoodModal";
import { getTable } from "@/actions/tables";
import { TableLoadingScreen } from "./TableLoadingScreen";
import { unlockTableRequest } from "@/lib/unlock-table";

export interface MenuItemWithCategory extends MenuItems {
  category: Category;
}

export interface PlacedOrder {
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

interface TableData {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
  isLocked: boolean;
}

interface TableViewProps {
  tableId: number;
  restaurantId: number;
  onClose: () => void;
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

export function TableView({ tableId, restaurantId, onClose }: TableViewProps) {
  const router = useRouter();
  const shouldUnlockRef = useRef(false);
  const unlockedRef = useRef(false);
  const [table, setTable] = useState<TableData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItemWithCategory | null>(
    null,
  );
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<
    number | null
  >(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [tableResponse, categoriesData, menuItemsData, ordersData] =
          await Promise.all([
            getTable(tableId, restaurantId),
            getCategories(restaurantId),
            getMenuItems(restaurantId),
            getTableOrders(tableId),
          ]);

        if (!tableResponse.success || !tableResponse.table) {
          setNotFound(true);
          return;
        }

        setTable(tableResponse.table);
        // FloorMap locks before opening this view; always unlock on leave.
        shouldUnlockRef.current = true;
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
  }, [restaurantId, tableId]);

  const unlockTable = async () => {
    if (unlockedRef.current || !shouldUnlockRef.current) return;
    unlockedRef.current = true;
    const ok = await unlockTableRequest(tableId);
    if (!ok) {
      unlockedRef.current = false;
      throw new Error("Failed to unlock table");
    }
    shouldUnlockRef.current = false;
  };

  const unlockTableKeepalive = useCallback(() => {
    if (unlockedRef.current || !shouldUnlockRef.current) return;
    unlockedRef.current = true;
    shouldUnlockRef.current = false;
    void unlockTableRequest(tableId, { keepalive: true });
  }, [tableId]);

  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    try {
      await unlockTable();
      onClose();
    } catch {
      toast.error("Failed to unlock table. Please try again.");
      setIsClosing(false);
    }
  };

  // Fallback unlock when leaving without the Back button (browser back, etc.)
  useEffect(() => {
    const onPageHide = () => unlockTableKeepalive();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      unlockTableKeepalive();
    };
  }, [unlockTableKeepalive]);

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
          orderItem.orderNotes === data.notes,
      );

      if (existingItem) {
        return currentOrder.map((orderItem) =>
          orderItem.id === existingItem.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem,
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
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const calculateTotal = () => {
    return order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    if (!table || order.length === 0) return;

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
            const ordersData = await getTableOrders(tableId);
            if (ordersData.success) {
              setPlacedOrders(ordersData.orders);
            }
            router.refresh();
          } else {
            toast.error("Failed to place order. Please try again.");
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
    return <TableLoadingScreen message="Loading table..." />;
  }

  if (notFound || !table) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
        <p className="text-gray-600">Table not found.</p>
      </div>
    );
  }

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.categoryId === selectedCategory)
    : menuItems;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Menu Items (Left Side) - Hidden on small screens unless menu is open */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-1/2 lg:w-2/3 xl:w-3/4 bg-white px-8 py-12 overflow-y-auto md:bg-opacity-100
            absolute md:relative top-0 left-0 right-0 bottom-0 z-10 md:z-auto h-full md:h-full`}
        >
          {/* Category Tabs - Hidden on small screens */}
          <div className="flex justify-between items-center mb-16 xl:text-xl">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isClosing}
              className="hidden md:inline-flex mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isClosing ? "Leaving..." : "Back"}
            </Button>
            <div className="hidden md:flex gap-2 overflow-x-auto pb-2  ">
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
          </div>

          {/* Categories List - Only visible on small screens */}
          {selectedMobileCategory === null ? (
            <div className="block md:hidden mb-6 mt-10 ">
              <h3 className="text-xl font-semibold mb-4">Categories</h3>
              <div className="space-y-2 border-b-2 border-gray-300 pb-6">
                {categories
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="w-full justify-start hover:bg-gray-100 transition-colors xl:text-xl"
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
                <h3 className="text-xl font-semibold mb-4">All Menu Items</h3>
                <div className="space-y-2">
                  {menuItems
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          handleAddToOrder(item);
                          setIsMenuOpen(false);
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm mt-1">{item.description}</p>
                          )}
                          <p className="text-xs mt-1">{item.category.name}</p>
                        </div>
                        <p className="font-medium ml-4">
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
                  className="hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setSelectedMobileCategory(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </div>
              <h3 className="text-xl font-semibold mb-4">
                {
                  categories.find((c) => c.id === selectedMobileCategory)?.name
                }{" "}
              </h3>
              <div className="space-y-2">
                {menuItems
                  .filter((item) => item.categoryId === selectedMobileCategory)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors "
                      onClick={() => {
                        handleAddToOrder(item);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                      <p className="font-medium ml-4">
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
                className="p-4 border border-gray-300 cursor-pointer hover:shadow-md transition text-black xl:text-xl"
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
                      <p className="text-sm">{item.description}</p>
                    )}
                  </div>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Orders (Right Side) - Full width on small screens */}
        <div className="flex h-full min-h-0 w-full flex-col md:w-1/2 lg:w-1/3 xl:w-1/4 md:border-l">
          {/* Hamburger Menu Button - Only visible on small screens */}
          <div className="z-50 flex items-center justify-between border-b-2 border-white bg-primary p-4 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isClosing}
              className="hover:bg-white hover:text-black transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold">Table {table.number}</h2>

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
          <div className="p-10 border-b-2 border-gray-300 md:mt-0 md:mb-0 md:border md:border-gray-600 text-black">
            <h3 className="text-xl text-white font-semibold mb-4">
              Current Order
            </h3>
            {order.length === 0 ? (
              <p className="text-black text-xl">No items in order</p>
            ) : (
              <div>
                <div className="space-y-4">
                  {order.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start p-3 rounded-lg border border-gray-300 bg-white"
                    >
                      <div className="text-2xl">
                        <h4 className="font-medium">{item.name}</h4>
                        {(item.spicyLevel || item.sides || item.orderNotes) && (
                          <div className="text-sm mt-1">
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
                          <span className="text-sm">{item.quantity}</span>
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
                                    : orderItem,
                                ),
                              );
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-xl">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <div className="border-t border-gray-300 mb-5" />
                  <div className="flex justify-between text-white text-2xl font-semibold">
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
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Placed Orders</h3>
              {placedOrders.some((order) => order.status === "Pending") && (
                <Button
                  onClick={() =>
                    router.push(
                      `/restaurants/${restaurantId}/tables/${table.id}/payment`,
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
                <p>No orders placed yet</p>
              ) : (
                placedOrders.map((placedOrder) => (
                  <Card
                    key={placedOrder.id}
                    className="p-4 border border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{placedOrder.orderNumber}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          {formatDate(placedOrder.createdAt)}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                          placedOrder.status,
                        )}`}
                      >
                        {placedOrder.status}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {placedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col text-sm border-b border-gray-200 pb-2 last:border-b-0 last:pb-0"
                        >
                          <div className="flex justify-between">
                            <span>
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span>
                              $
                              {(item.menuItem.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {(item.spicyLevel || item.sides || item.notes) && (
                            <div className="text-xs mt-1">
                              {item.spicyLevel && (
                                <p>Spicy Level: {item.spicyLevel}</p>
                              )}
                              {item.sides && <p>Sides: {item.sides}</p>}
                              {item.notes && <p>Notes: {item.notes}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="border-t border-gray-300 pt-2 mt-2">
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
