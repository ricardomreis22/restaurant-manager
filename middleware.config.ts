import type { NextAuthConfig } from "next-auth";

// Minimal config for middleware - no heavy dependencies like Prisma or bcrypt
// The full auth logic with providers is in auth.config.ts for API routes
export const middlewareConfig = {
  // Empty providers - authentication happens in API routes, not middleware
  providers: [],
} satisfies NextAuthConfig;

