import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';

/**
 * HTTP Error Classes
 *
 * Convenience classes for common HTTP errors.
 * Each class corresponds to a specific HTTP status code.
 */

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode = ErrorCode.BAD_REQUEST, details?: unknown) {
    super(message, 400, errorCode, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = ErrorCode.UNAUTHORIZED, details?: unknown) {
    super(message, 401, errorCode, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errorCode = ErrorCode.FORBIDDEN, details?: unknown) {
    super(message, 403, errorCode, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = ErrorCode.NOT_FOUND, details?: unknown) {
    super(message, 404, errorCode, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', errorCode = ErrorCode.RESOURCE_CONFLICT, details?: unknown) {
    super(message, 409, errorCode, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 422, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, false, details);
  }
}
