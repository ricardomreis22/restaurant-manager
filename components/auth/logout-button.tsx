"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      Logout
    </Button>
  );
};
