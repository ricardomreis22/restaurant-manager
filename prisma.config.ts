import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use placeholder during build when DATABASE_URL isn't set (e.g. Vercel before env is available).
// Set DATABASE_URL in Vercel Project Settings → Environment Variables for runtime and migrations.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
