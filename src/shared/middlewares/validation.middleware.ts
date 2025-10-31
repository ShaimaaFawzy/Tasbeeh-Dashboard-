import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../errors/http-errors.js';
import { asyncHandler } from '../utils/async-handler.js';

/**
 * Validation Middleware
 *
 * Validates request body, query, or params against a Zod schema.
 * Throws ValidationError if validation fails.
 */

type ValidationType = 'body' | 'query' | 'params';

/**
 * Creates a validation middleware for a specific request part
 *
 * @param schema - Zod schema to validate against
 * @param type - Part of request to validate ('body', 'query', or 'params')
 * @returns Express middleware function
 *
 * @example
 * router.post('/users',
 *   validate(createUserSchema, 'body'),
 *   userController.createUser
 * );
 */
export const validate = (schema: AnyZodObject, type: ValidationType = 'body') => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const validated = await schema.parseAsync(req[type]);
        req[type] = validated;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ValidationError('Validation failed', error.errors);
        }
        throw error;
      }
    }
  );
};

/**
 * Convenience function to validate request body
 */
export const validateBody = (schema: AnyZodObject) => validate(schema, 'body');

/**
 * Convenience function to validate query parameters
 */
export const validateQuery = (schema: AnyZodObject) => validate(schema, 'query');

/**
 * Convenience function to validate route parameters
 */
export const validateParams = (schema: AnyZodObject) => validate(schema, 'params');
