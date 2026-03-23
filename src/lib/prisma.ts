import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit in serverless environments like Next.js API routes.
 *
 * Learn more: 
 * https://pris.ly/d/help/next-js-best-practices
 */

// Define a global variable to store the Prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Create a new Prisma client or reuse the existing one
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
    // Prisma has built-in connection pooling
  });

// In development, attach to global to prevent connection pool exhaustion
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
