/**
 * Audit Log Repository
 *
 * Handles all database operations related to audit logs.
 * Records administrative actions for compliance and security monitoring.
 */

import { prisma } from '../../database/prisma.client.js';
import { AuditLog } from '@prisma/client';

/**
 * Data required to create an audit log entry
 */
export interface CreateAuditLogData {
  userId: string;
  adminEmail?: string;
  action: string;
  module: string;
  resourceType?: string;
  resourceId?: string;
  details?: string;
  ipAddress: string;
  userAgent?: string;
  status: string;
}

export class AuditLogRepository {
  /**
   * Create a new audit log entry
   *
   * @param data - Audit log data
   * @returns Created audit log entry
   */
  async create(data: CreateAuditLogData): Promise<AuditLog> {
    return await prisma.auditLog.create({
      data: {
        userId: data.userId,
        adminEmail: data.adminEmail,
        action: data.action,
        module: data.module,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
      },
    });
  }

  /**
   * Find audit logs by user ID
   *
   * @param userId - User ID to search for
   * @param skip - Number of records to skip (for pagination)
   * @param take - Number of records to take (for pagination)
   * @returns Array of audit log entries
   */
  async findByUserId(
    userId: string,
    skip: number = 0,
    take: number = 10
  ): Promise<AuditLog[]> {
    return await prisma.auditLog.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find audit logs by action type
   *
   * @param action - Action type to search for
   * @param skip - Number of records to skip (for pagination)
   * @param take - Number of records to take (for pagination)
   * @returns Array of audit log entries
   */
  async findByAction(
    action: string,
    skip: number = 0,
    take: number = 10
  ): Promise<AuditLog[]> {
    return await prisma.auditLog.findMany({
      where: { action },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find audit logs by module
   *
   * @param module - Module name to search for
   * @param skip - Number of records to skip (for pagination)
   * @param take - Number of records to take (for pagination)
   * @returns Array of audit log entries
   */
  async findByModule(
    module: string,
    skip: number = 0,
    take: number = 10
  ): Promise<AuditLog[]> {
    return await prisma.auditLog.findMany({
      where: { module },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Count total audit logs for a user
   *
   * @param userId - User ID to count for
   * @returns Total number of audit log entries
   */
  async countByUserId(userId: string): Promise<number> {
    return await prisma.auditLog.count({
      where: { userId },
    });
  }
}
