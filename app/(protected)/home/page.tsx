import { signOut } from "@/auth";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Button>
        <Link href="/restaurants">Restaurants</Link>
      </Button>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/auth/login" });
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}
