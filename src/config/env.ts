import { z } from 'zod';
import dotenv from 'dotenv';

/**
 * Environment Configuration
 *
 * Validates and exports environment variables using Zod.
 * Ensures all required environment variables are present and correctly typed.
 */

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // API Documentation (Swagger/OpenAPI)
  ENABLE_SWAGGER: z
    .string()
    .default('true')
    .transform((val) => val === 'true' || val === '1'),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  API_TITLE: z.string().default('Tasbeeh API Documentation'),
  API_VERSION: z.string().default('1.0.0'),
});

/**
 * Validates environment variables and throws an error if validation fails
 */
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.issues.forEach((err:any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Validated environment configuration
 */
export const env = validateEnv();

/**
 * Type-safe environment configuration
 */
export type Env = z.infer<typeof envSchema>;
