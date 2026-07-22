"use client";

import { useState, useEffect, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import { getTableOrders, payOrder } from "@/actions/orders";
import { getTables } from "@/actions/tables";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@prisma/client";
import { cn } from "@/lib/utils";

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

function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = parseInt(params.restaurantId as string);
  const tableId = parseInt(params.tableId as string);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [table, setTable] = useState<Table | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [showChange, setShowChange] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const tableResponse = await getTables(restaurantId);
        if (tableResponse.success) {
          const foundTable = tableResponse.tables.find((t) => t.id === tableId);
          if (foundTable) {
            setTable(foundTable);
          }
        }

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

  const calculateTotalAmount = (orders: PlacedOrder[]) =>
    orders
      .filter((order) => order.status === "Pending")
      .reduce((sum, order) => sum + order.totalAmount, 0);

  const handleOpenCashDrawer = () => {
    toast.success("Cash drawer opened");
  };

  const calculateChange = () => {
    const total = calculateTotalAmount(placedOrders);
    const received = parseFloat(cashReceived);
    if (Number.isNaN(received)) return 0;
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
      (order) => order.status === "Pending",
    );

    startTransition(async () => {
      try {
        for (const order of pendingOrders) {
          await payOrder(order.id);
        }

        if (paymentMethod === "CASH") {
          handleOpenCashDrawer();
          setShowChange(true);
        }

        toast.success("Payment completed");

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
    return (
      <div className="flex h-full items-center justify-center bg-primary text-lg text-primary-foreground">
        Loading checkout...
      </div>
    );
  }

  const pendingOrders = placedOrders.filter(
    (order) => order.status === "Pending",
  );
  const totalAmount = calculateTotalAmount(placedOrders);
  const itemCount = pendingOrders.reduce(
    (count, order) =>
      count + order.items.reduce((sum, item) => sum + item.quantity, 0),
    0,
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-primary">
      <main className="flex min-h-0 flex-1 flex-col px-4 py-4 lg:px-6 lg:py-5">
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Order summary — Square-style receipt panel */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-6 py-5 sm:px-8">
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                Checkout
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-neutral-900 md:text-3xl">
                Table {table.number}
              </h2>
              <p className="mt-2 text-lg text-neutral-500">
                Order summary · {itemCount}{" "}
                {itemCount === 1 ? "item" : "items"} · {pendingOrders.length}{" "}
                {pendingOrders.length === 1 ? "order" : "orders"}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
              {pendingOrders.length === 0 ? (
                <p className="py-8 text-center text-lg text-neutral-500">
                  No pending orders for this table.
                </p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="py-5 first:pt-0 last:pb-0">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium uppercase tracking-wide text-neutral-400 md:text-base">
                          {order.orderNumber}
                        </span>
                        <span className="text-lg font-semibold tabular-nums text-neutral-900 md:text-xl">
                          {formatMoney(order.totalAmount)}
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {order.items.map((item, index) => (
                          <li
                            key={`${order.id}-${index}`}
                            className="flex items-start justify-between gap-4 text-lg md:text-xl"
                          >
                            <span className="text-neutral-700">
                              <span className="font-semibold text-neutral-900">
                                {item.quantity}
                              </span>
                              <span className="text-neutral-400"> × </span>
                              {item.menuItem.name}
                            </span>
                            <span className="shrink-0 tabular-nums font-medium text-neutral-600">
                              {formatMoney(
                                item.menuItem.price * item.quantity,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-neutral-200 bg-neutral-50 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-neutral-600 md:text-xl">
                  Total
                </span>
                <span className="text-3xl font-semibold tabular-nums text-neutral-900 md:text-4xl">
                  {formatMoney(totalAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Payment — Square-style tender panel */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="shrink-0 border-b border-neutral-200 px-6 py-5 sm:px-8">
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                Amount due
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-neutral-900 md:text-4xl">
                {formatMoney(totalAmount)}
              </p>
              <p className="mt-2 text-lg text-neutral-500">
                Select how the guest is paying
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-6 py-6 sm:px-8">
              <Label className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500 md:text-base">
                Payment method
              </Label>
              <div className="mb-8 grid grid-cols-2 gap-3 rounded-xl bg-neutral-100 p-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={cn(
                    "flex items-center justify-center gap-3 rounded-lg px-4 py-4 text-lg font-semibold transition-all md:py-5 md:text-xl",
                    paymentMethod === "CARD"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900",
                  )}
                >
                  <CreditCard className="h-6 w-6" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "flex items-center justify-center gap-3 rounded-lg px-4 py-4 text-lg font-semibold transition-all md:py-5 md:text-xl",
                    paymentMethod === "CASH"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900",
                  )}
                >
                  <Wallet className="h-6 w-6" />
                  Cash
                </button>
              </div>

              {paymentMethod === "CASH" && (
                <div className="mb-8 space-y-5">
                  <div>
                    <Label
                      htmlFor="cash-received"
                      className="mb-3 block text-lg font-medium text-neutral-700 md:text-xl"
                    >
                      Cash received
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-neutral-400">
                        $
                      </span>
                      <Input
                        id="cash-received"
                        type="number"
                        inputMode="decimal"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="h-16 border-neutral-200 bg-white pl-10 text-2xl tabular-nums md:text-3xl"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[20, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        className="h-14 border-neutral-200 bg-white text-lg font-semibold text-neutral-800 hover:bg-neutral-50 md:text-xl"
                        onClick={() => setCashReceived(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  {showChange && parseFloat(cashReceived) > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-5">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-6 w-6 shrink-0" />
                        <p className="text-lg font-medium md:text-xl">
                          Change due
                        </p>
                      </div>
                      <p className="mt-2 text-4xl font-semibold tabular-nums text-emerald-700 md:text-5xl">
                        {formatMoney(calculateChange())}
                      </p>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={handleOpenCashDrawer}
                    variant="outline"
                    className="h-14 w-full border-neutral-200 bg-white text-lg text-neutral-800 md:text-xl"
                  >
                    <Banknote className="h-5 w-5" />
                    Open cash drawer
                  </Button>
                </div>
              )}

              {paymentMethod === "CARD" && (
                <div className="mb-8 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center">
                  <CreditCard className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                  <p className="text-lg font-medium text-neutral-700 md:text-xl">
                    Ready for card payment
                  </p>
                  <p className="mt-2 text-base text-neutral-500 md:text-lg">
                    Process the card on your terminal, then charge below.
                  </p>
                </div>
              )}

              <div className="mt-auto space-y-4 pt-2">
                <Button
                  className="h-16 w-full rounded-xl bg-neutral-900 text-xl font-semibold text-white hover:bg-neutral-800 md:h-[4.5rem] md:text-2xl"
                  size="lg"
                  onClick={handlePayAllOrders}
                  disabled={isProcessingPayment || pendingOrders.length === 0}
                >
                  {isProcessingPayment
                    ? "Processing..."
                    : `Charge ${formatMoney(totalAmount)}`}
                </Button>

                {showChange && paymentMethod === "CASH" && (
                  <Button
                    className="h-14 w-full border-neutral-200 text-lg md:text-xl"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/restaurants/${restaurantId}/tables/${tableId}`,
                      )
                    }
                  >
                    Complete transaction
                  </Button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
