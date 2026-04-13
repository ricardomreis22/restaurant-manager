"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, List, LogOut, FolderPlus } from "lucide-react";
import { useAdminRestaurant } from "@/contexts/AdminRestaurantContext";

export interface AdminRestaurantSidePanelProps {
  restaurantId: number;
}

export function AdminRestaurantSidePanel({
  restaurantId,
}: AdminRestaurantSidePanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    sidePanelOpen,
    setSidePanelOpen,
    sidePanelOnAddCategory,
  } = useAdminRestaurant();

  const isAdminRestaurantRoute = pathname.includes("/admin/restaurants/");

  return (
    <>
      <div
        className={`absolute inset-0 z-20 bg-black/20 transition-opacity ${
          sidePanelOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidePanelOpen(false)}
      />

      <div
        className={`absolute inset-y-0 right-0 z-30 overflow-hidden transition-[width] duration-300 ${
          sidePanelOpen ? "w-72" : "w-0"
        }`}
      >
        <div className="relative flex h-full min-h-0 w-72 flex-col border-l bg-background p-4 shadow-xl">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setSidePanelOpen(false)}
            className="absolute -left-10 top-6 z-10 h-9 w-9 rounded-md border bg-red-600 shadow-sm hover:bg-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-primary" />
          </Button>

          <div className="flex shrink-0 flex-col items-center pt-6">
            <Image
              src="/restmanager.png"
              alt="logo"
              width={208}
              height={208}
              className="h-40 w-40 object-contain"
            />
          </div>

          <div className="mt-auto flex min-h-0 flex-col gap-2 border-t border-border pt-4">
            {sidePanelOnAddCategory ? (
              <Button
                type="button"
                onClick={() => {
                  sidePanelOnAddCategory();
                  setSidePanelOpen(false);
                }}
                variant="outline"
                className="h-12 w-full justify-start text-base"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            ) : null}
            {isAdminRestaurantRoute ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full justify-start text-base"
                onClick={() => {
                  router.push(`/restaurants/${restaurantId}`);
                  setSidePanelOpen(false);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Leave Admin
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full justify-start text-base"
              onClick={() => {
                router.push("/restaurants");
                setSidePanelOpen(false);
              }}
            >
              <List className="mr-2 h-4 w-4" />
              Back to Restaurants
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full justify-start text-base"
              onClick={() => {
                setSidePanelOpen(false);
                signOut({ callbackUrl: "/auth/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
