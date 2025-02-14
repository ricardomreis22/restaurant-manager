import { checkAdmin } from "@/actions/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will protect all routes under /admin
  await checkAdmin();

  return (
    <div>
      {/* You can add admin layout UI here, like a sidebar or header */}
      <div className="p-6">{children}</div>
    </div>
  );
}
