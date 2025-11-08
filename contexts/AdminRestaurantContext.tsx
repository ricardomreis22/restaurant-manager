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
}

const AdminRestaurantContext = createContext<
  AdminRestaurantContextType | undefined
>(undefined);

export function AdminRestaurantProvider({ children }: { children: ReactNode }) {
  const [currentTab, setCurrentTab] = useState<AdminTab>("floormap");

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
