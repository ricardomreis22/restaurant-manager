import { signOut } from "@/auth";

export default function Home() {
  return (
    <>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/auth/login" });
        }}
      >
        <button type="submit">Sign Out</button>

        <button>Create Restaurant</button>
      </form>
    </>
  );
}
