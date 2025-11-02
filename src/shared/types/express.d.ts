/**
 * Express Type Extensions
 *
 * Extends Express Request type to include custom properties.
 */

import { JwtPayload } from './common.types.js';

/**
 * Audit information extracted from request
 */
export interface AuditInfo {
  ipAddress: string;
  userAgent: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      requestId?: string;
      auditInfo?: AuditInfo;
    }
  }
}

export {};
