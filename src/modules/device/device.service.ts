import { DeviceRepository } from './device.repository.js';
import { CreateDeviceDTO } from './dtos/create-device.dto.js';
import { UpdateDeviceDTO } from './dtos/update-device.dto.js';
import { GetAllDevicesQueryDTO } from './dtos/get-all-devices-query.dto.js';
import { DeviceItemDTO } from './dtos/get-all-devices-response.dto.js';
import { ConflictError, NotFoundError } from '../../shared/errors/http-errors.js';
import { ErrorCode } from '../../shared/errors/error-codes.js';
import { Device } from '@prisma/client';
import { calculateSkip, createPaginatedResult, PaginatedResult } from '../../shared/utils/pagination.js';
import { AuditLogService } from '../../shared/services/audit-log.service.js';
import { Request } from 'express';

/**
 * Device Service
 *
 * Contains all business logic for device operations.
 * Handles device CRUD operations, validation, and business rules.
 */

/**
 * Response type for device operations
 */
export interface DeviceResponse {
  id: string;
  deviceId: string;
  userId: string;
  paringDate: Date;
  usageCount: number;
  deviceStatus: boolean;
  lastSync: Date;
}

/**
 * Paginated response type
 */
export interface PaginatedDeviceResponse {
  devices: DeviceResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DeviceService {
  private readonly deviceRepository: DeviceRepository;
  private readonly auditLogService: AuditLogService;

  constructor() {
    this.deviceRepository = new DeviceRepository();
    this.auditLogService = new AuditLogService();
  }

  /**
   * Create a new device
   *
   * Validates that the device ID is unique before creating.
   *
   * @param userId - User ID from JWT token
   * @param data - Device creation data
   * @returns Created device information
   * @throws {ConflictError} If device ID already exists
   */
  async createDevice(userId: string, data: CreateDeviceDTO): Promise<DeviceResponse> {
    // Check if device ID already exists
    const existingDevice = await this.deviceRepository.findByDeviceId(data.deviceId);
    if (existingDevice) {
      throw new ConflictError(
        'Device ID already exists',
        ErrorCode.USER_ALREADY_EXISTS
      );
    }

    // Create the device
    const device = await this.deviceRepository.create({
      deviceId: data.deviceId,
      deviceStatus: data.deviceStatus,
      usageCount: 0,
      user: {
        connect: { id: userId },
      },
    });

    return this.formatDeviceResponse(device);
  }

  /**
   * Get a device by ID
   *
   * @param id - Device ID
   * @returns Device information
   * @throws {NotFoundError} If device not found
   */
  async getDeviceById(id: string): Promise<DeviceResponse> {
    const device = await this.deviceRepository.findById(id);

    if (!device) {
      throw new NotFoundError(
        'Device not found',
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    return this.formatDeviceResponse(device);
  }

  /**
   * Get all devices for a specific user
   *
   * @param userId - User ID
   * @returns Array of devices belonging to the user
   */
  async getDevicesByUserId(userId: string): Promise<DeviceResponse[]> {
    const devices = await this.deviceRepository.findByUserId(userId);
    return devices.map(device => this.formatDeviceResponse(device));
  }

  /**
   * Get all devices with pagination
   *
   * @param page - Page number (starting from 1)
   * @param limit - Number of items per page
   * @returns Paginated devices
   */
  async getAllDevices(page: number = 1, limit: number = 10): Promise<PaginatedDeviceResponse> {
    const skip = (page - 1) * limit;

    const [devices, total] = await Promise.all([
      this.deviceRepository.findAll(skip, limit),
      this.deviceRepository.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      devices: devices.map(device => this.formatDeviceResponse(device)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Update a device
   *
   * @param id - Device ID
   * @param data - Update data
   * @returns Updated device information
   * @throws {NotFoundError} If device not found
   * @throws {ConflictError} If new device ID already exists
   */
  async updateDevice(id: string, data: UpdateDeviceDTO): Promise<DeviceResponse> {
    // Check if device exists
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new NotFoundError(
        'Device not found',
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    // If updating device ID, check if new device ID already exists
    if (data.deviceId && data.deviceId !== device.deviceId) {
      const existingDevice = await this.deviceRepository.findByDeviceId(data.deviceId);
      if (existingDevice) {
        throw new ConflictError(
          'Device ID already exists',
          ErrorCode.USER_ALREADY_EXISTS
        );
      }
    }

    // Update the device
    const updatedDevice = await this.deviceRepository.update(id, data);

    return this.formatDeviceResponse(updatedDevice);
  }

  /**
   * Delete a device (soft delete)
   *
   * @param id - Device ID
   * @returns Deleted device information
   * @throws {NotFoundError} If device not found
   */
  async deleteDevice(id: string): Promise<DeviceResponse> {
    // Check if device exists
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new NotFoundError(
        'Device not found',
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    // Soft delete the device
    const deletedDevice = await this.deviceRepository.delete(id);

    return this.formatDeviceResponse(deletedDevice);
  }

  /**
   * Increment device usage count
   *
   * @param id - Device ID
   * @returns Updated device information
   * @throws {NotFoundError} If device not found
   */
  async incrementUsageCount(id: string): Promise<DeviceResponse> {
    const device = await this.deviceRepository.findById(id);
    if (!device) {
      throw new NotFoundError(
        'Device not found',
        ErrorCode.RESOURCE_NOT_FOUND
      );
    }

    const updatedDevice = await this.deviceRepository.update(id, {
      usageCount: device.usageCount + 1,
    });

    return this.formatDeviceResponse(updatedDevice);
  }

  /**
   * Get all devices with filters and pagination (Admin only)
   *
   * Retrieves a paginated list of devices with optional search and filtering.
   * Logs the admin action to audit log.
   *
   * @param query - Query parameters for filtering and pagination
   * @param req - Express request object (for audit logging)
   * @returns Paginated devices list
   */
  async getAllDevicesForAdmin(
    query: GetAllDevicesQueryDTO,
    req: Request
  ): Promise<PaginatedResult<DeviceItemDTO>> {
    const { search, filterBy, sortOrder, page, limit } = query;

    // Calculate pagination
    const skip = calculateSkip(page, limit);

    // Get devices and total count
    const [devices, totalItems] = await Promise.all([
      this.deviceRepository.findAllWithFilters(
        { search, filterBy, sortOrder },
        { skip, take: limit }
      ),
      this.deviceRepository.countAllWithFilters({ search }),
    ]);

    // Map devices to response DTO
    const mappedDevices: DeviceItemDTO[] = devices.map((device) => ({
      deviceId: device.deviceId,
      linkedUser: device.user.name,
      pairingDate: device.paringDate.toISOString(),
      lastSync: device.lastSync.toISOString(),
      usageCount: device.usageCount,
    }));

    // Log admin action to audit log
    if (req.user && req.auditInfo) {
      await this.auditLogService.logAdminAction({
        adminId: req.user.userId,
        adminEmail: req.user.email || '',
        action: 'GET_ALL_DEVICES',
        resourceType: 'devices',
        details: { search, filterBy, sortOrder, page, limit },
        ipAddress: req.auditInfo.ipAddress,
        userAgent: req.auditInfo.userAgent,
        status: 'success',
      });
    }

    return createPaginatedResult(mappedDevices, totalItems, page, limit);
  }

  /**
   * Format device for response (helper method)
   *
   * @param device - Device from database
   * @returns Formatted device response
   * @private
   */
  private formatDeviceResponse(device: Device): DeviceResponse {
    return {
      id: device.id,
      deviceId: device.deviceId,
      userId: device.userId,
      paringDate: device.paringDate,
      usageCount: device.usageCount,
      deviceStatus: device.deviceStatus,
      lastSync: device.lastSync,
    };
  }
}
