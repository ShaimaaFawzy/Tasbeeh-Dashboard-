import { prisma, disconnectPrisma } from '../database/prisma.client.js';
import { logger } from '../shared/utils/logger.js';

/**
 * Database Configuration
 *
 * Handles database connection, health checks, and graceful shutdown.
 */

/**
 * Tests the database connection
 *
 * @returns Promise that resolves if connection is successful
 * @throws Error if connection fails
 */
export const testDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connection established successfully');
  } catch (error:any) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Performs a health check on the database
 *
 * @returns Promise that resolves to true if database is healthy
 */
export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error:any) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Gracefully disconnects from the database
 */
export const gracefulDatabaseShutdown = async (): Promise<void> => {
  try {
    await disconnectPrisma();
    logger.info('Database connection closed gracefully');
  } catch (error:any) {
    logger.error('Error during database shutdown:', error);
    throw error;
  }
};
