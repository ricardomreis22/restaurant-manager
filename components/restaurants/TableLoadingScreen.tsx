import { Loader2 } from "lucide-react";

interface TableLoadingScreenProps {
  message?: string;
}

export function TableLoadingScreen({
  message = "Loading...",
}: TableLoadingScreenProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}
