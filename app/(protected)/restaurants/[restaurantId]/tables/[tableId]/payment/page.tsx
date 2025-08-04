"use client";

import { useState, useEffect, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  CreditCard,
  Receipt,
  Wallet,
  DollarSign,
} from "lucide-react";
import { getTableOrders, payOrder } from "@/actions/orders";
import { getTables } from "@/actions/tables";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface PlacedOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: {
    quantity: number;
    menuItem: {
      name: string;
      price: number;
    };
  }[];
}

type PaymentMethod = "CARD" | "CASH";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = parseInt(params.restaurantId as string);
  const tableId = parseInt(params.tableId as string);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [table, setTable] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [showChange, setShowChange] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load table details
        const tableResponse = await getTables(restaurantId);
        if (tableResponse.success) {
          const foundTable = tableResponse.tables.find((t) => t.id === tableId);
          if (foundTable) {
            setTable(foundTable);
          }
        }

        // Load orders
        const ordersResponse = await getTableOrders(tableId);
        if (ordersResponse.success) {
          setPlacedOrders(ordersResponse.orders);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [restaurantId, tableId]);

  const calculateTotalAmount = (orders: PlacedOrder[]) => {
    return orders
      .filter((order) => order.status === "Pending")
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const handleOpenCashDrawer = () => {
    // In a real implementation, this would communicate with your POS hardware
    toast.success("Cash drawer opened");
  };

  const calculateChange = () => {
    const total = calculateTotalAmount(placedOrders);
    const received = parseFloat(cashReceived);
    if (isNaN(received)) return 0;
    return Math.max(received - total, 0);
  };

  const handlePayAllOrders = () => {
    if (paymentMethod === "CASH" && !cashReceived) {
      toast.error("Please enter the cash amount received");
      return;
    }

    if (
      paymentMethod === "CASH" &&
      parseFloat(cashReceived) < calculateTotalAmount(placedOrders)
    ) {
      toast.error("Cash received is less than the total amount");
      return;
    }

    setIsProcessingPayment(true);
    const pendingOrders = placedOrders.filter(
      (order) => order.status === "Pending"
    );

    startTransition(async () => {
      try {
        // Process all pending orders sequentially
        for (const order of pendingOrders) {
          await payOrder(order.id);
          console.log("ORDER PAID", order.id);
        }

        if (paymentMethod === "CASH") {
          handleOpenCashDrawer();
          setShowChange(true);
        }

        toast.success("All orders paid successfully!");

        // Don't redirect immediately for cash payments to show change
        if (paymentMethod === "CARD") {
          router.push(`/restaurants/${restaurantId}/tables/${tableId}`);
        }
      } catch (error) {
        console.error("Failed to process payments:", error);
        toast.error("Failed to process payments. Please try again.");
      } finally {
        setIsProcessingPayment(false);
      }
    });
  };

  if (!table) {
    return <div>Loading...</div>;
  }

  const pendingOrders = placedOrders.filter(
    (order) => order.status === "Pending"
  );

  const totalAmount = calculateTotalAmount(placedOrders);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() =>
              router.push(`/restaurants/${restaurantId}/tables/${tableId}`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Table
          </Button>
          <h1 className="text-2xl font-bold text-white">Payment Summary</h1>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Orders Summary */}
          <Card className="p-6 bg-white shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-gray-900">
                Table {table.number} - Pending Orders
              </h2>
            </div>

            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{order.orderNumber}</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm text-gray-500"
                      >
                        <span>
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span>
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              <div className="border-t mt-6 pt-4">
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total Amount</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Options */}
          <Card className="p-6 bg-white shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Payment Method</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={paymentMethod === "CARD" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("CARD")}
                  className="h-20"
                >
                  <CreditCard className="h-6 w-6 mb-1" />
                  <span className="block">Card</span>
                </Button>
                <Button
                  variant={paymentMethod === "CASH" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("CASH")}
                  className="h-20"
                >
                  <Wallet className="h-6 w-6 mb-1" />
                  <span className="block">Cash</span>
                </Button>
              </div>

              {paymentMethod === "CASH" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cash Received
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="pl-10"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {showChange && parseFloat(cashReceived) > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">
                        Change Due
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        ${calculateChange().toFixed(2)}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleOpenCashDrawer}
                    variant="outline"
                    className="w-full"
                  >
                    Open Cash Drawer
                  </Button>
                </div>
              )}

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handlePayAllOrders}
                disabled={isProcessingPayment || pendingOrders.length === 0}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessingPayment
                  ? "Processing Payment..."
                  : `Pay ${totalAmount.toFixed(2)}`}
              </Button>

              {showChange && paymentMethod === "CASH" && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/restaurants/${restaurantId}/tables/${tableId}`
                    )
                  }
                >
                  Complete Transaction
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
