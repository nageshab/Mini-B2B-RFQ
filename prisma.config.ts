import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 configuration file.
 *
 * In Prisma 7, the datasource URL is no longer set inside schema.prisma.
 * It is read from this file by the Prisma CLI (migrate, generate, studio).
 *
 * The runtime PrismaClient instance (src/config/prisma.ts) receives the URL
 * automatically from process.env via dotenv, which is loaded above.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
