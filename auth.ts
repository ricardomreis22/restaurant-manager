import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(token.sub) },
      });

      if (!existingUser) return token;

      token.userRole = existingUser.userRole;
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
