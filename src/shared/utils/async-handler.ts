import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async Handler Wrapper
 *
 * Wraps async route handlers to catch errors and pass them to the error handling middleware.
 * Eliminates the need for try-catch blocks in every async route handler.
 *
 * @param fn - The async route handler function
 * @returns A wrapped function that catches and forwards errors
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAllUsers();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
