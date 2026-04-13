import type { AdminTab } from "@/contexts/AdminRestaurantContext";

export const ADMIN_RESTAURANT_TABS: { id: AdminTab; label: string }[] = [
  { id: "floormap", label: "Floor Map" },
  { id: "employees", label: "Staff" },
  { id: "activity", label: "Activity Log" },
  { id: "menu-management", label: "Menu Management" },
];

export function isAdminRestaurantPath(pathname: string) {
  return /^\/admin\/restaurants\/\d+$/.test(pathname);
}
