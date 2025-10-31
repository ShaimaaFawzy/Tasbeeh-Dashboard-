import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 *
 * This module exports a singleton instance of PrismaClient to ensure
 * only one instance is created throughout the application lifecycle.
 * This prevents connection pool exhaustion and improves performance.
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

/**
 * Global singleton instance of PrismaClient
 * In development, we use global to preserve the instance across hot reloads
 */
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Graceful shutdown handler for Prisma
 */
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};
