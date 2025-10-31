import pino from 'pino';

/**
 * Logger Configuration
 *
 * Configures and exports a Pino logger instance for application-wide logging.
 * Uses pretty printing in development for better readability.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context
 *
 * @param context - Additional context to include in all log messages
 * @returns A child logger instance
 *
 * @example
 * const userLogger = createLogger({ module: 'user' });
 * userLogger.info('User created successfully');
 */
export const createLogger = (context: Record<string, unknown>): pino.Logger => {
  return logger.child(context);
};
