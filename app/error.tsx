"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-red-200">
        {error.message}
      </p>
      <p className="text-xs text-gray-400">
        Check the browser console (F12) for the full stack trace.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
