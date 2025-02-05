import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { UserRole } from "@prisma/client";

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
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Add the user role to the token, so we can use it in the middleware, to add admin routes, and have role based access control
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(Number(token.sub));

      if (!existingUser) return token;

      token.user = existingUser;
      return token;
    },
    // Add the user id to the session
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.userRole = token.userRole as UserRole;
      }
      return session;
    },
  },
  ...authConfig,
});
