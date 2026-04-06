"use client";

/** Tabs live in the global protected nav (`AdminRestaurantDesktopTabsGate`) on all breakpoints. */
function AdminRestaurantLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function AdminRestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRestaurantLayoutContent>{children}</AdminRestaurantLayoutContent>
  );
}
