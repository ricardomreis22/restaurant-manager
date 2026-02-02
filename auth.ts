import NextAuth, { type DefaultSession } from "next-auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

import authConfig from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      userRole: UserRole;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  // Trust host for Vercel deployments
  trustHost: true,
  callbacks: {
    async jwt({ token }) {
      if (!token.sub) return token;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: parseInt(token.sub) },
        });
        if (existingUser) token.userRole = existingUser.userRole;
      } catch {
        // DB unreachable (e.g. wrong DATABASE_URL); keep existing token
      }
      return token;
    },
    async session({ token, session }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.userRole = token.userRole as UserRole;
      }
      return session;
    },
  },
  ...authConfig,
});
