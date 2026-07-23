"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { unlockTableRequest } from "@/lib/unlock-table";
import { toast } from "sonner";

const tabs = [
  { id: "floormap", label: "Floor map" },
  { id: "table", label: "Table" },
  { id: "payment", label: "Payment" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function TableFlowNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const tableId = params.tableId as string;
  const [isLeaving, setIsLeaving] = useState(false);

  const activeTab: TabId | null = pathname.endsWith("/payment")
    ? "payment"
    : "table";

  const handleNavigate = async (tabId: TabId) => {
    if (tabId === "floormap") {
      if (isLeaving) return;
      setIsLeaving(true);
      const ok = await unlockTableRequest(parseInt(tableId, 10));
      if (!ok) {
        toast.error("Failed to unlock table. Please try again.");
        setIsLeaving(false);
        return;
      }
      router.push(`/restaurants/${restaurantId}?tab=floormap`);
      return;
    }

    if (tabId === "payment") {
      router.push(`/restaurants/${restaurantId}/tables/${tableId}/payment`);
      return;
    }

    router.push(`/restaurants/${restaurantId}/tables/${tableId}`);
  };

  return (
    <nav className="shrink-0 border-b border-white/15 bg-primary px-4 py-3 lg:px-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div aria-hidden />

        <div
          className="inline-flex rounded-xl bg-white/10 p-1"
          role="tablist"
          aria-label="Table navigation"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={isLeaving}
                onClick={() => {
                  void handleNavigate(tab.id);
                }}
                className={cn(
                  "min-w-[6.5rem] rounded-lg px-4 py-2.5 text-base font-semibold transition-all md:min-w-[7.5rem] md:px-5 md:py-3 md:text-lg",
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground",
                  isLeaving && "opacity-60",
                )}
              >
                {tab.id === "floormap" && isLeaving ? "Leaving..." : tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="text-base font-semibold text-primary-foreground hover:bg-white/10 md:text-lg"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
