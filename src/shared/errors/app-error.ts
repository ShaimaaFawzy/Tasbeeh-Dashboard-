import { ErrorCode } from './error-codes.js';

/**
 * Base Application Error Class
 *
 * Custom error class that extends the native Error class.
 * Provides a consistent structure for all application errors.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  /**
   * Creates a new AppError instance
   *
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   * @param errorCode - Application-specific error code
   * @param isOperational - Whether this is an operational error (vs programming error)
   * @param details - Additional error details or context
   */
  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    isOperational = true,
    details?: unknown
  ) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
