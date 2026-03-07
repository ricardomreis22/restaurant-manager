"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type AdminTab =
  | "floormap"
  | "menu"
  | "menu-management"
  | "employees"
  | "activity";

const VALID_TABS: AdminTab[] = [
  "floormap",
  "employees",
  "activity",
  "menu-management",
];

interface AdminRestaurantContextType {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
}

const AdminRestaurantContext = createContext<
  AdminRestaurantContextType | undefined
>(undefined);

function parseTabFromUrl(tab: string | null): AdminTab {
  if (tab && VALID_TABS.includes(tab as AdminTab)) return tab as AdminTab;
  return "floormap";
}

export function AdminRestaurantProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = parseTabFromUrl(searchParams.get("tab"));
  const [currentTab, setCurrentTabState] = useState<AdminTab>(tabFromUrl);

  useEffect(() => {
    setCurrentTabState(tabFromUrl);
  }, [tabFromUrl]);

  const setCurrentTab = (tab: AdminTab) => {
    setCurrentTabState(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <AdminRestaurantContext.Provider value={{ currentTab, setCurrentTab }}>
      {children}
    </AdminRestaurantContext.Provider>
  );
}

export function useAdminRestaurant() {
  const context = useContext(AdminRestaurantContext);
  if (context === undefined) {
    throw new Error(
      "useAdminRestaurant must be used within an AdminRestaurantProvider"
    );
  }
  return context;
}

// Optional version that doesn't throw when used outside provider
export function useAdminRestaurantOptional() {
  return useContext(AdminRestaurantContext);
}
