"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAdminRestaurantOptional } from "@/contexts/AdminRestaurantContext";

const ADMIN_RESTAURANT_PATH = /^\/admin\/restaurants\/(\d+)/;
const RESTAURANT_PATH = /^\/restaurants\/(\d+)/;

export function ProtectedNavLogo() {
  const pathname = usePathname();
  const router = useRouter();
  const adminContext = useAdminRestaurantOptional();

  const handleLogoClick = () => {
    const adminMatch = pathname.match(ADMIN_RESTAURANT_PATH);
    if (adminMatch) {
      adminContext?.setCurrentTab("floormap");
      return;
    }

    const restaurantMatch = pathname.match(RESTAURANT_PATH);
    if (restaurantMatch) {
      router.push(`/restaurants/${restaurantMatch[1]}?tab=floormap`);
      return;
    }

    router.push("/restaurants");
  };

  return (
    <button
      type="button"
      onClick={handleLogoClick}
      className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
      aria-label="Go to floor map"
    >
      <Image
        src="/favicon.ico"
        alt="logo"
        width={60}
        height={48}
        className="h-12 w-15 cursor-pointer"
      />
    </button>
  );
}
