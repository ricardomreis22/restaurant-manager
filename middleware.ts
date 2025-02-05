import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  console.log(req.auth, "req.auth");

  // Get user role from auth
  const userRole = req.auth?.user?.userRole;

  // Example of role-based access control
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && userRole !== UserRole.ADMIN) {
    return Response.redirect(new URL("/restaurants/", nextUrl));
  }

  if (isApiAuthRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return;
});

// invoke middleware on all routes except for next static files nextjs/image
// invoke middleware on private routes and public routes and then decide if the user is authenticated or not
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
