import { auth, signOut } from "@/auth";

import { Button } from "@/components/ui/button";

const SettingsPage = async () => {
  const session = await auth();

  return (
    <div>
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
};

export default SettingsPage;
