import React from "react";
import { currentUserRole } from "@/lib/auth-utils";

const AdminPage = async () => {
  const role = await currentUserRole();

  return (
    <div>
      <h1>Admin Page</h1>
      <p>Current Role: {role}</p>
    </div>
  );
};

export default AdminPage;
