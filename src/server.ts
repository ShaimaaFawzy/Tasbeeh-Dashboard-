import { createApp } from './app.js';
import { env } from './config/env.js';
import { testDatabaseConnection, gracefulDatabaseShutdown } from './config/database.js';
import { logger } from './shared/utils/logger.js';

/**
 * Server Entry Point
 *
 * Starts the Express server and handles graceful shutdown.
 */

/**
 * Starts the application server
 */
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await testDatabaseConnection();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`
🚀 Server started successfully!
📡 Environment: ${env.NODE_ENV}
🔗 Port: ${env.PORT}
🌐 URL: http://localhost:${env.PORT}
📚 API Docs: http://localhost:${env.PORT}/api/health
      `);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connection
          await gracefulDatabaseShutdown();

          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
