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
      className={`absolute top-2 right-2 ${
        isLocked ? "text-red-500" : "text-green-500"
      }`}
    >
      {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
    </Button>
  );
};
