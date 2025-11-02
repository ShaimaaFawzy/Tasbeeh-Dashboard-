import path from 'path';
import fs from 'fs';
import { createStream } from 'rotating-file-stream';
import pino from 'pino';
import { env } from './env.js';

/**
 * Logger Configuration
 *
 * Provides configuration for file-based and console logging with hourly rotation.
 * Logs are organized in date folders (YYYYMMDD) with hourly files (HH.log).
 */

/**
 * Log configuration interface
 */
export interface LoggerConfig {
  logToFile: boolean;
  logToConsole: boolean;
  logLevel: string;
  logDir: string;
}

/**
 * Get logger configuration from environment variables
 */
export const getLoggerConfig = (): LoggerConfig => {
  return {
    logToFile: env.LOG_TO_FILE,
    logToConsole: env.LOG_TO_CONSOLE,
    logLevel: env.LOG_LEVEL,
    logDir: env.LOG_DIR,
  };
};

/**
 * Generate log filename with date folder and hourly file
 *
 * @param time - Current time (can be number timestamp or Date)
 * @returns Path in format: YYYYMMDD/HH.log
 *
 * @example
 * generateLogFilename(new Date('2025-11-02T14:30:00'))
 * // Returns: "20251102/14.log"
 */
export function generateLogFilename(): string {
  const now =  new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');

  const dateFolder = `${year}${month}${day}`;
  return `${dateFolder}/${hour}.log.txt`;
}

/**
 * Ensure log directory exists
 *
 * @param logDir - Log directory path
 */
export function ensureLogDirectoryExists(logDir: string): void {
  try {
    const absoluteLogDir = path.isAbsolute(logDir)
    ? logDir
    : path.resolve(process.cwd(), logDir);
    console.log(`[Logger] Ensuring log directory exists: ${absoluteLogDir}`);

    if (!fs.existsSync(absoluteLogDir)) {
      fs.mkdirSync(absoluteLogDir, { recursive: true });
      console.log(`[Logger] Created log directory: ${absoluteLogDir}`);
    }
  } catch (error) {
    console.error('[Logger] Failed to create log directory:', error);
    throw new Error(`Failed to create log directory: ${logDir}`);
  }
}

/**
 * Create rotating file stream for log files
 *
 * @param logDir - Log directory path
 * @returns Rotating file stream
 */
export function createLogFileStream(logDir: string): NodeJS.WritableStream {
  try {
    // Ensure log directory exists
    ensureLogDirectoryExists(logDir);

    const absoluteLogDir = path.isAbsolute(logDir)
      ? logDir
      : path.resolve(process.cwd(), logDir);

    // Ensure the current date folder exists before stream starts writing
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateFolder = `${year}${month}${day}`;
    const dateFolderPath = path.join(absoluteLogDir, dateFolder);

    if (!fs.existsSync(dateFolderPath)) {
      fs.mkdirSync(dateFolderPath, { recursive: true });
      console.log(`[Logger] Created date folder: ${dateFolderPath}`);
    }

    // Create rotating file stream with custom filename generator
    const stream = createStream(generateLogFilename, {
      path: absoluteLogDir,
      interval: '1h', // Rotate hourly
      maxSize: '10M', // Max file size 10MB (safety limit)
      maxFiles: 1000, // Keep max 1000 files
      compress: false, // Don't compress (can be enabled with 'gzip')
    });

    // Handle stream errors gracefully
    stream.on('error', (err) => {
      console.error('[Logger] File stream error:', err);
    });

    stream.on('rotation', () => {
      console.log('[Logger] Log file rotated');

      // Ensure next date folder exists when rotating
      const rotationTime = new Date();
      const rotationYear = rotationTime.getFullYear();
      const rotationMonth = String(rotationTime.getMonth() + 1).padStart(2, '0');
      const rotationDay = String(rotationTime.getDate()).padStart(2, '0');
      const rotationDateFolder = `${rotationYear}${rotationMonth}${rotationDay}`;
      const rotationDateFolderPath = path.join(absoluteLogDir, rotationDateFolder);

      if (!fs.existsSync(rotationDateFolderPath)) {
        fs.mkdirSync(rotationDateFolderPath, { recursive: true });
        console.log(`[Logger] Created date folder on rotation: ${rotationDateFolderPath}`);
      }
    });

    return stream;
  } catch (error) {
    console.error('[Logger] Failed to create file stream:', error);
    throw error;
  }
}

/**
 * Create pino streams based on configuration
 *
 * @returns Array of pino streams
 */
export function createPinoStreams(): pino.StreamEntry[] {
  const config = getLoggerConfig();
  const streams: pino.StreamEntry[] = [];

  // Validate configuration
  if (!config.logToFile && !config.logToConsole) {
    console.warn(
      '[Logger] Both file and console logging are disabled. Defaulting to console logging.'
    );
    config.logToConsole = true;
  }

  // Console stream
  if (config.logToConsole) {
    if (env.NODE_ENV === 'development') {
      // Pretty print in development
      streams.push({
        level: config.logLevel as pino.Level,
        stream: pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }),
      });
    } else {
      // JSON format in production
      streams.push({
        level: config.logLevel as pino.Level,
        stream: process.stdout,
      });
    }
  }

  // File stream
  if (config.logToFile) {
    try {
      const fileStream = createLogFileStream(config.logDir);
      streams.push({
        level: config.logLevel as pino.Level,
        stream: fileStream,
      });
      console.log(`[Logger] File logging enabled: ${config.logDir}`);
    } catch (error) {
      console.error('[Logger] Failed to enable file logging:', error);
      console.warn('[Logger] Falling back to console-only logging');
    }
  }

  return streams;
}

/**
 * Get pino logger options
 *
 * @returns Pino logger options
 */
export function getPinoOptions(): pino.LoggerOptions {
  return {
    level: env.LOG_LEVEL,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      // Properly serialize errors with stack traces
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    // Redact sensitive data
    redact: {
      paths: [
        'password',
        'req.headers.authorization',
        'req.headers.cookie',
        'token',
        'accessToken',
        'refreshToken',
        'secret',
      ],
      remove: true,
    },
  };
}
