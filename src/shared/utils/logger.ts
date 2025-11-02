import pino from 'pino';
import type { Request } from 'express';
import {
  createPinoStreams,
  getPinoOptions,
  getLoggerConfig,
} from '../../config/logger.config.js';

/**
 * Logger Utilities
 *
 * Provides enhanced logging with file and console support.
 * Supports hourly log rotation organized by date folders (YYYYMMDD/HH.log).
 *
 * Features:
 * - Console and/or file logging
 * - Hourly log rotation
 * - Automatic sensitive data redaction
 * - Request context tracking
 * - Child loggers with context binding
 */

/**
 * Log context interface
 */
export interface LogContext {
  module?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Initialize logger based on configuration
 */
function initializeLogger(): pino.Logger {
  const config = getLoggerConfig();
  const streams = createPinoStreams();
  const options = getPinoOptions();

  // Use multistream if multiple streams are enabled
  if (streams.length > 1) {
    return pino(options, pino.multistream(streams));
  } else if (streams.length === 1) {
    return pino(options, streams[0].stream);
  } else {
    // Fallback to stdout if no streams configured
    console.warn('[Logger] No streams configured, using stdout');
    return pino(options);
  }
}

/**
 * Main application logger instance
 *
 * @example
 * logger.info('Application started');
 * logger.error({ err: error }, 'Failed to process request');
 */
export const logger = initializeLogger();

/**
 * Create a child logger with additional context
 *
 * Use this to add persistent context to all log messages from a specific module or service.
 *
 * @param context - Additional context to bind to the logger
 * @returns A child logger instance with bound context
 *
 * @example
 * const userLogger = createChildLogger({ module: 'user-service', userId: '123' });
 * userLogger.info('Processing user data'); // Automatically includes module and userId
 */
export const createChildLogger = (context: LogContext): pino.Logger => {
  return logger.child(context);
};

/**
 * Legacy alias for createChildLogger (for backward compatibility)
 *
 * @deprecated Use createChildLogger instead
 */
export const createLogger = createChildLogger;

/**
 * Create a logger with request context
 *
 * Extracts relevant information from Express request and creates a child logger.
 * Useful for tracking requests across multiple log entries.
 *
 * @param req - Express request object
 * @returns Logger with request context
 *
 * @example
 * const reqLogger = getRequestLogger(req);
 * reqLogger.info('Processing request');
 */
export const getRequestLogger = (req: Request): pino.Logger => {
  const reqId = (req as any).id || req.headers['x-request-id'];
  const requestId = typeof reqId === 'string' ? reqId : generateRequestId();

  const context: LogContext = {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
  };

  // Add user context if available (from auth middleware)
  if (req.user) {
    context.userId = (req.user as any).userId;
  }

  return logger.child(context);
};

/**
 * Generate a simple request ID
 *
 * @returns Random request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log slow operations (operations taking longer than threshold)
 *
 * @param operation - Operation name
 * @param duration - Duration in milliseconds
 * @param threshold - Threshold in milliseconds (default: 1000ms)
 * @param context - Additional context
 */
export function logSlowOperation(
  operation: string,
  duration: number,
  threshold: number = 1000,
  context?: LogContext
): void {
  if (duration > threshold) {
    const logContext = {
      operation,
      duration,
      threshold,
      ...context,
    };

    if (duration > threshold * 5) {
      logger.error(logContext, `Very slow operation: ${operation}`);
    } else if (duration > threshold * 2) {
      logger.warn(logContext, `Slow operation: ${operation}`);
    } else {
      logger.info(logContext, `Operation took longer than expected: ${operation}`);
    }
  }
}

/**
 * Utility to measure and log operation duration
 *
 * @param operation - Operation name
 * @param fn - Function to execute and measure
 * @param context - Additional context
 * @returns Result of the function
 *
 * @example
 * const result = await measureOperation('fetchUserData', async () => {
 *   return await database.users.findById(userId);
 * }, { userId });
 */
export async function measureOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logSlowOperation(operation, duration, 1000, context);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(
      {
        operation,
        duration,
        err: error,
        ...context,
      },
      `Operation failed: ${operation}`
    );
    throw error;
  }
}
