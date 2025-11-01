/**
 * Swagger/OpenAPI Helper Utilities
 *
 * Provides reusable utility functions for generating consistent API documentation.
 * These helpers make it easier to document endpoints with standardized responses.
 *
 * Usage in JSDoc comments:
 * @swagger
 * /api/users:
 *   get:
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * Standard response helper type
 */
export interface StandardResponseConfig {
  description: string;
  schemaRef: string;
  example?: any;
}

/**
 * Error response helper type
 */
export interface ErrorResponseConfig {
  code: number;
  description: string;
  errorCode?: string;
  example?: any;
}

/**
 * Security requirement for protected endpoints
 */
export interface SecurityRequirement {
  bearerAuth: string[];
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Generate a standard success response schema reference
 *
 * @param description - Human-readable description of the response
 * @param schemaRef - Reference to the schema (e.g., 'UserResponse', 'DeviceResponse')
 * @returns Formatted response object for OpenAPI documentation
 *
 * @example
 * const response = standardResponse('User retrieved successfully', 'UserResponse');
 */
export const standardResponse = (
  description: string,
  schemaRef: string
): StandardResponseConfig => {
  return {
    description,
    schemaRef: `#/components/schemas/${schemaRef}`,
  };
};

/**
 * Generate an error response schema reference
 *
 * @param code - HTTP status code
 * @param description - Human-readable error description
 * @param errorCode - Machine-readable error code (optional)
 * @returns Formatted error response object
 *
 * @example
 * const error = errorResponse(404, 'Resource not found', 'NOT_FOUND');
 */
export const errorResponse = (
  code: number,
  description: string,
  errorCode?: string
): ErrorResponseConfig => {
  return {
    code,
    description,
    errorCode,
  };
};

/**
 * Generate security requirement for JWT authentication
 *
 * Use this for endpoints that require authentication.
 *
 * @returns Security requirement object for OpenAPI
 *
 * @example
 * // In JSDoc:
 * // security:
 * //   - bearerAuth: []
 */
export const securityRequirement = (): SecurityRequirement => {
  return {
    bearerAuth: [],
  };
};

/**
 * Generate paginated response schema
 *
 * @param itemSchema - Schema name for individual items (e.g., 'UserResponse')
 * @returns Paginated response configuration
 *
 * @example
 * const paginated = paginatedResponse('DeviceResponse');
 */
export const paginatedResponse = (itemSchema: string) => {
  return {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      message: {
        type: 'string',
        example: 'Data retrieved successfully',
      },
      data: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              $ref: `#/components/schemas/${itemSchema}`,
            },
          },
          total: {
            type: 'integer',
            example: 100,
            description: 'Total number of items',
          },
          page: {
            type: 'integer',
            example: 1,
            description: 'Current page number',
          },
          limit: {
            type: 'integer',
            example: 10,
            description: 'Items per page',
          },
          totalPages: {
            type: 'integer',
            example: 10,
            description: 'Total number of pages',
          },
        },
      },
    },
  };
};

/**
 * Common pagination query parameters
 *
 * Use this for endpoints that support pagination.
 *
 * @example
 * // In JSDoc:
 * // parameters:
 * //   - in: query
 * //     name: page
 * //     schema:
 * //       type: integer
 * //       minimum: 1
 * //       default: 1
 */
export const paginationParameters = () => {
  return [
    {
      name: 'page',
      in: 'query',
      description: 'Page number (starts at 1)',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        default: 1,
      },
    },
    {
      name: 'limit',
      in: 'query',
      description: 'Number of items per page',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
      },
    },
  ];
};

/**
 * Common HTTP response codes and their descriptions
 */
export const HTTP_RESPONSES = {
  SUCCESS: {
    code: 200,
    description: 'Request completed successfully',
  },
  CREATED: {
    code: 201,
    description: 'Resource created successfully',
  },
  NO_CONTENT: {
    code: 204,
    description: 'Request completed successfully with no content',
  },
  BAD_REQUEST: {
    code: 400,
    description: 'Invalid request parameters or body',
    schemaRef: '#/components/responses/ValidationError',
  },
  UNAUTHORIZED: {
    code: 401,
    description: 'Authentication required or invalid token',
    schemaRef: '#/components/responses/UnauthorizedError',
  },
  FORBIDDEN: {
    code: 403,
    description: 'Insufficient permissions to access this resource',
    schemaRef: '#/components/responses/ForbiddenError',
  },
  NOT_FOUND: {
    code: 404,
    description: 'Requested resource not found',
    schemaRef: '#/components/responses/NotFoundError',
  },
  CONFLICT: {
    code: 409,
    description: 'Request conflicts with existing data',
    schemaRef: '#/components/responses/ConflictError',
  },
  INTERNAL_ERROR: {
    code: 500,
    description: 'Internal server error',
    schemaRef: '#/components/responses/ServerError',
  },
};

/**
 * Generate UUID parameter documentation
 *
 * @param name - Parameter name (e.g., 'id', 'userId')
 * @param description - Parameter description
 * @returns UUID parameter object
 *
 * @example
 * const param = uuidParameter('id', 'Device identifier');
 */
export const uuidParameter = (name: string, description: string) => {
  return {
    name,
    in: 'path',
    description,
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  };
};

/**
 * Generate common error responses for protected endpoints
 *
 * Returns 401, 403, and 500 response definitions
 *
 * @example
 * // In JSDoc:
 * // responses:
 * //   401: { $ref: '#/components/responses/UnauthorizedError' }
 * //   403: { $ref: '#/components/responses/ForbiddenError' }
 * //   500: { $ref: '#/components/responses/ServerError' }
 */
export const protectedEndpointResponses = () => {
  return {
    401: {
      $ref: '#/components/responses/UnauthorizedError',
    },
    403: {
      $ref: '#/components/responses/ForbiddenError',
    },
    500: {
      $ref: '#/components/responses/ServerError',
    },
  };
};

/**
 * Generate common error responses for public endpoints
 *
 * Returns 400 and 500 response definitions
 *
 * @example
 * // In JSDoc:
 * // responses:
 * //   400: { $ref: '#/components/responses/ValidationError' }
 * //   500: { $ref: '#/components/responses/ServerError' }
 */
export const publicEndpointResponses = () => {
  return {
    400: {
      $ref: '#/components/responses/ValidationError',
    },
    500: {
      $ref: '#/components/responses/ServerError',
    },
  };
};

/**
 * Common tags used throughout the API
 */
export const API_TAGS = {
  AUTHENTICATION: 'Authentication',
  DEVICES: 'Devices',
  USERS: 'Users',
  HEALTH: 'Health',
};
