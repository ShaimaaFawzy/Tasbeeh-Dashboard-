/**
 * Audit Log Service
 *
 * Provides business logic for audit logging.
 * Handles logging of administrative actions for compliance and security monitoring.
 */

import { AuditLogRepository } from '../repositories/audit-log.repository.js';
import { logger } from '../utils/logger.js';

/**
 * Audit log data interface
 */
export interface AuditLogData {
  adminId: string;
  adminEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
}

export class AuditLogService {
  private readonly auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  /**
   * Log an administrative action
   *
   * This method creates an audit log entry in the database and also logs to Pino logger.
   * If audit logging fails, the error is logged but does not throw to prevent
   * disrupting the main request flow.
   *
   * @param data - Audit log data
   * @returns void
   */
  async logAdminAction(data: AuditLogData): Promise<void> {
    try {
      // Log to Pino logger first
      logger.info(
        {
          adminId: data.adminId,
          adminEmail: data.adminEmail,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: data.status,
        },
        `Admin Action: ${data.action} on ${data.resourceType}`
      );

      // Create audit log entry in database
      await this.auditLogRepository.create({
        userId: data.adminId,
        adminEmail: data.adminEmail,
        action: data.action,
        module: data.resourceType,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details ? JSON.stringify(data.details) : undefined,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
      });
    } catch (error) {
      // Log the error but don't throw to prevent disrupting the main request
      logger.error(
        {
          error,
          adminId: data.adminId,
          action: data.action,
          resourceType: data.resourceType,
        },
        'Failed to create audit log entry'
      );
    }
  }

  /**
   * Get audit logs for a specific admin user
   *
   * @param userId - Admin user ID
   * @param page - Page number
   * @param limit - Number of items per page
   * @returns Array of audit logs with count
   */
  async getAuditLogsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ logs: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.auditLogRepository.findByUserId(userId, skip, limit),
      this.auditLogRepository.countByUserId(userId),
    ]);

    return { logs, total };
  }
}
