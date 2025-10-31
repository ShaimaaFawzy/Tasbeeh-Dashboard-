/**
 * Express Type Extensions
 *
 * Extends Express Request type to include custom properties.
 */

import { JwtPayload } from './common.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      requestId?: string;
    }
  }
}

export {};
