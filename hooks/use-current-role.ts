import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const useCurrentRole = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      console.warn("User is not authenticated");
    }
  }, [status]);

  if (status === "loading") {
    return null;
  }

  return session?.user?.userRole || null;
};
