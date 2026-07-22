"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowLeft, List, LogOut, Menu, Plus, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ADMIN_RESTAURANT_TABS } from "@/components/auth/admin-restaurant-nav";
import { STAFF_RESTAURANT_TABS } from "@/components/auth/staff-restaurant-nav";
import { useAdminRestaurant } from "@/contexts/AdminRestaurantContext";
import { useCurrentRole } from "@/hooks/use-current-role";
import { cn } from "@/lib/utils";

const ADMIN_RESTAURANT_PATH = /^\/admin\/restaurants\/(\d+)$/;
const RESTAURANT_DETAIL_PATH = /^\/restaurants\/(\d+)$/;

/** Solid primary — no transparency (matches navbar action style). */
const navActionClass =
  "bg-primary text-primary-foreground shadow-sm border-0 hover:brightness-[0.92] hover:text-primary-foreground";

const panelButtonClass = cn(
  "h-12 w-full justify-start text-base",
  navActionClass,
);

export function ProtectedNavRightActions() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRole = useCurrentRole();
  const { currentTab, setCurrentTab } = useAdminRestaurant();
  const adminMatch = pathname.match(ADMIN_RESTAURANT_PATH);
  const restaurantMatch = pathname.match(RESTAURANT_DETAIL_PATH);
  const [panelOpen, setPanelOpen] = useState(false);
  const isRestaurantsList = pathname === "/restaurants";
  const isAdminRestaurantsList = pathname === "/admin/restaurants";

  useEffect(() => {
    setPanelOpen(false);
  }, [pathname]);

  if (adminMatch) {
    const restaurantId = adminMatch[1];

    return (
      <>
        <Button
          type="button"
          variant="default"
          size="icon"
          className={cn(navActionClass, "relative z-[106]")}
          aria-label={panelOpen ? "Close menu" : "Open menu"}
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((o) => !o)}
        >
          {panelOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div
          className={cn(
            "fixed inset-0 z-[100] bg-black/20 transition-opacity duration-300 ",
            panelOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          onClick={() => setPanelOpen(false)}
          aria-hidden
        />

        <div
          className={cn(
            "fixed right-0 top-0 z-[105] h-full overflow-x-visible overflow-y-hidden transition-[width] duration-300 ease-out",
            panelOpen ? "w-full sm:w-72" : "w-0",
          )}
        >
          <div
            className={cn(
              "relative flex h-full w-full flex-col gap-2 border-l justify-between border-white/15 bg-black/90 p-4 text-white shadow-xl sm:w-72",
              "max-sm:border-l-0",
            )}
          >
            <div className="flex flex-col items-center">
              <Image
                src="/restmanager.png"
                alt="logo"
                width={300}
                height={300}
                className="h-48 w-48 object-contain"
              />
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {ADMIN_RESTAURANT_TABS.map(({ id, label }) => (
                <Button
                  key={id}
                  type="button"
                  variant="default"
                  className={cn(
                    panelButtonClass,
                    currentTab === id && "ring-2 ring-primary-foreground",
                  )}
                  onClick={() => {
                    setCurrentTab(id);
                    setPanelOpen(false);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="w-full gap-2 flex flex-col ">
              <div className="bg-white/20 h-px w-full my-10"></div>
              <Button
                type="button"
                variant="default"
                className={panelButtonClass}
                onClick={() => {
                  router.push(`/restaurants/${restaurantId}`);
                  setPanelOpen(false);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Leave Admin
              </Button>
              <Button
                type="button"
                variant="default"
                className={panelButtonClass}
                onClick={() => {
                  router.push("/restaurants");
                  setPanelOpen(false);
                }}
              >
                <List className="mr-2 h-4 w-4" />
                Backs to Restaurants
              </Button>
              <Button
                type="button"
                variant="default"
                className={panelButtonClass}
                onClick={() => {
                  setPanelOpen(false);
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

  if (restaurantMatch) {
    const restaurantId = restaurantMatch[1];
    const staffTab = searchParams.get("tab") || "floormap";

    return (
      <>
        <Button
          type="button"
          variant="default"
          size="icon"
          className={cn(navActionClass, "relative z-[106]")}
          aria-label={panelOpen ? "Close menu" : "Open menu"}
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((o) => !o)}
        >
          {panelOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div
          className={cn(
            "fixed inset-0 z-[100] bg-black/20 transition-opacity duration-300",
            panelOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          onClick={() => setPanelOpen(false)}
          aria-hidden
        />

        <div
          className={cn(
            "fixed right-0 top-0 z-[105] h-full overflow-x-visible overflow-y-hidden transition-[width] duration-300 ease-out",
            panelOpen ? "w-full sm:w-72" : "w-0",
          )}
        >
          <div
            className={cn(
              "relative flex h-full w-full flex-col justify-between gap-2 border-l border-white/15 bg-black/90 p-4 text-white shadow-xl sm:w-72",
              "max-sm:border-l-0",
            )}
          >
            <div className="flex flex-col items-center">
              <Image
                src="/restmanager.png"
                alt="logo"
                width={300}
                height={300}
                className="h-48 w-48 object-contain"
              />
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {STAFF_RESTAURANT_TABS.map(({ id, label }) => (
                <Button
                  key={id}
                  type="button"
                  variant="default"
                  className={cn(
                    panelButtonClass,
                    staffTab === id && "ring-2 ring-primary-foreground",
                  )}
                  onClick={() => {
                    router.push(`/restaurants/${restaurantId}?tab=${id}`);
                    setPanelOpen(false);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2">
              <div className="my-10 h-px w-full bg-white/20" />
              {userRole === "ADMIN" && (
                <Button
                  type="button"
                  variant="default"
                  className={panelButtonClass}
                  onClick={() => {
                    router.push(`/admin/restaurants/${restaurantId}`);
                    setPanelOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin View
                </Button>
              )}
              <Button
                type="button"
                variant="default"
                className={panelButtonClass}
                onClick={() => {
                  router.push("/restaurants");
                  setPanelOpen(false);
                }}
              >
                <List className="mr-2 h-4 w-4" />
                Back to restaurants
              </Button>
              <Button
                type="button"
                variant="default"
                className={panelButtonClass}
                onClick={() => {
                  setPanelOpen(false);
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

  return (
    <>
      <div className="sm:hidden">
        <Button
          type="button"
          variant="default"
          size="icon"
          className={cn(navActionClass, "relative z-[106]")}
          aria-label={panelOpen ? "Close menu" : "Open menu"}
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((o) => !o)}
        >
          {panelOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div
          className={cn(
            "fixed inset-0 z-[100] bg-black/20 transition-opacity duration-300",
            panelOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          onClick={() => setPanelOpen(false)}
          aria-hidden
        />

        <div
          className={cn(
            "fixed right-0 top-0 z-[105] h-full overflow-x-visible overflow-y-hidden transition-[width] duration-300 ease-out",
            panelOpen ? "w-full sm:w-72" : "w-0",
          )}
        >
          <div
            className={cn(
              "relative flex h-full w-full flex-col justify-between gap-2 border-l border-white/15 bg-black/90 p-4 text-white shadow-xl sm:w-72",
              "max-sm:border-l-0",
            )}
          >
            <div className="flex flex-col items-center">
              <Image
                src="/restmanager.png"
                alt="logo"
                width={300}
                height={300}
                className="h-48 w-48 object-contain"
              />
            </div>
            <div className="mt-auto flex w-full flex-col gap-2">
              {isRestaurantsList && (
                <div className="flex w-full flex-col gap-2">
                  <Button
                    type="button"
                    variant="default"
                    className={panelButtonClass}
                    onClick={() => {
                      router.push("/admin/restaurants");
                      setPanelOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin dashboard
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className={panelButtonClass}
                    onClick={() => {
                      router.push("/restaurants/newrestaurant");
                      setPanelOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add restaurant
                  </Button>
                </div>
              )}
              {isAdminRestaurantsList && (
                <div className="flex w-full flex-col gap-2">
                  <Button
                    type="button"
                    variant="default"
                    className={panelButtonClass}
                    onClick={() => {
                      router.push("/restaurants");
                      setPanelOpen(false);
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to restaurants
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className={panelButtonClass}
                    onClick={() => {
                      router.push("/restaurants/newrestaurant");
                      setPanelOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add restaurant
                  </Button>
                </div>
              )}
              <div className="mb-4 h-px w-full bg-white/20" />
              <Button
                type="button"
                variant="default"
                className={panelButtonClass}
                onClick={() => {
                  setPanelOpen(false);
                  signOut({ callbackUrl: "/auth/login" });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <LogoutButton />
      </div>
    </>
  );
}
