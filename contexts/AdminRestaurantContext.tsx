"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type AdminTab =
  | "floormap"
  | "menu"
  | "menu-management"
  | "employees"
  | "activity";

interface AdminRestaurantContextType {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidePanelOnAddCategory: (() => void) | null;
  setSidePanelOnAddCategory: React.Dispatch<
    React.SetStateAction<(() => void) | null>
  >;
}

const AdminRestaurantContext = createContext<
  AdminRestaurantContextType | undefined
>(undefined);

export function AdminRestaurantProvider({ children }: { children: ReactNode }) {
  const [currentTab, setCurrentTab] = useState<AdminTab>("floormap");
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelOnAddCategory, setSidePanelOnAddCategory] = useState<
    (() => void) | null
  >(null);

  return (
    <AdminRestaurantContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        sidePanelOpen,
        setSidePanelOpen,
        sidePanelOnAddCategory,
        setSidePanelOnAddCategory,
      }}
    >
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
