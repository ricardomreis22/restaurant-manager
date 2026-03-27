"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableLockerProps {
  tableId: number;
  isLocked: boolean;
  onToggleLock: (tableId: number, locked: boolean) => void;
}

export const TableLocker = ({
  tableId,
  isLocked,
  onToggleLock,
}: TableLockerProps) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleLock(tableId, !isLocked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={`absolute right-2 top-2 text-red-600 hover:bg-red-50 hover:text-red-700 ${
        isLocked ? "" : "opacity-90"
      }`}
    >
      {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
    </Button>
  );
};
