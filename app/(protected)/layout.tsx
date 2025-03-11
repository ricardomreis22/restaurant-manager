import { LogoutButton } from "@/components/auth/logout-button";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div>
      {session?.user?.userRole === "ADMIN" && (
        <div>
          <Link href="/admin/restaurants">
            <Button variant="ghost" className="gap-2">
              <Settings className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        </div>
      )}
      <nav className="bg-secondary p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="font-semibold">Restaurant Manager</div>
          {session?.user?.userRole === "ADMIN" && (
            <Button variant="ghost">Restaurants</Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
