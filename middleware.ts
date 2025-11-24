import NextAuth from "next-auth";
import { middlewareConfig } from "./middleware.config";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

// Use minimal config for middleware to avoid importing heavy dependencies (Prisma, bcrypt)
// The full auth config with providers is only used in API routes
const { auth } = NextAuth(middlewareConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Handle auth routes (login/register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  // Handle API routes
  if (isApiAuthRoute) {
    return;
  }

  // Handle non-authenticated routes
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
