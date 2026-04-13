"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navPrimarySolid =
  "bg-primary text-primary-foreground shadow-sm border-0 hover:brightness-[0.92] hover:text-primary-foreground";

export const LogoutButton = () => {
  return (
    <Button
      variant="default"
      className={cn(navPrimarySolid)}
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      Logout
    </Button>
  );
};
