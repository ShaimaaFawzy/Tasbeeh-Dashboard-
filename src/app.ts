import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { logger } from './shared/utils/logger.js';
import { errorHandler, notFoundHandler } from './shared/middlewares/error-handler.js';
import router from './routes/index.js';
import { env } from './config/env.js';
import { swaggerSpec, swaggerUiOptions } from './config/swagger.config.js';

/**
 * Express App Configuration
 *
 * Sets up and configures the Express application with all necessary middleware,
 * routes, and error handlers.
 */

/**
 * Creates and configures the Express application
 *
 * @returns Configured Express application
 */
export const createApp = (): Application => {
  const app = express();

  // Security middleware
  // Disable CSP for Swagger UI in development
  if (env.ENABLE_SWAGGER && env.NODE_ENV !== 'production') {
    app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
  } else {
    app.use(helmet());
  }

  // CORS middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logging
  // app.use(
  //   pinoHttp({
  //     logger,
  //     autoLogging: true,
  //     customLogLevel: (req, res, err) => {
  //       if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
  //       if (res.statusCode >= 500 || err) return 'error';
  //       return 'info';
  //     },
  //   })
  // );

  // API Documentation (Swagger)
  // Only enable in development and staging environments
  if (env.ENABLE_SWAGGER && env.NODE_ENV !== 'production') {
    logger.info('Swagger documentation enabled at /api-docs');

    // Serve Swagger UI at /api-docs
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );

    // Redirect /docs to /api-docs for convenience
    app.get('/docs', (req, res) => {
      res.redirect('/api-docs');
    });
  } else {
    // Return 404 for documentation routes in production
    app.get(['/api-docs', '/docs'], (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API documentation is not available in production',
      });
    });
  }

  // API routes
  app.use('/api', router);

  // Root endpoint
  app.get('/', (req, res) => {
    const response: any = {
      success: true,
      message: 'Welcome to the Tasbeeh API',
      version: env.API_VERSION,
      endpoints: {
        health: '/api/health',
        api: '/api',
      },
    };

    // Include documentation link only if Swagger is enabled
    if (env.ENABLE_SWAGGER && env.NODE_ENV !== 'production') {
      response.endpoints.documentation = '/api-docs';
    }

    res.json(response);
  });

  // 404 handler - must be after all other routes
  app.use(notFoundHandler);

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
};
