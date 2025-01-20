import { LogoutButton } from "@/components/auth/logout-button";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="bg-secondary p-4 flex justify-between items-center">
        <div>Your Logo/Brand</div>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
