export const STAFF_RESTAURANT_TABS = [
  { id: "floormap", label: "Floor Map" },
  { id: "activity", label: "Activity Log" },
] as const;

export type StaffRestaurantTab = (typeof STAFF_RESTAURANT_TABS)[number]["id"];

export function isStaffRestaurantPath(pathname: string) {
  return /^\/restaurants\/\d+$/.test(pathname);
}
