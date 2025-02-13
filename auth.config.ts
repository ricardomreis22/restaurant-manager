import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

const prisma = new PrismaClient();

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              userRole: user.userRole,
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
