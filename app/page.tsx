"use client";
import { LoginButton } from "@/components/auth/login-button";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-semibold drop-shadow-md">Auth</h1>
        <LoginButton>Sign in</LoginButton>
      </div>
    </div>
  );
}
