import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

/**
 * Singleton PrismaClient instance using the Prisma 7 PostgreSQL driver adapter.
 *
 * Why a singleton?
 * PrismaClient manages a connection pool internally. Creating a new instance
 * on every request would exhaust database connections quickly. One shared
 * instance reuses pooled connections across the entire application lifetime.
 *
 * Why the global trick in development?
 * Next.js / ts-node / tsx re-evaluates modules on hot reload, which would
 * create new PrismaClient instances and log "there are already N instances"
 * warnings. Attaching to `globalThis` in non-production environments avoids
 * that, while production always creates exactly one instance at startup.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
