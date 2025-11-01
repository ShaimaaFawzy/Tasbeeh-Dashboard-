import { prisma } from '../../database/prisma.client.js';
import { Device, Prisma } from '@prisma/client';

/**
 * Device Repository
 *
 * Handles all database operations related to devices.
 * Follows the repository pattern to separate data access logic from business logic.
 */

export class DeviceRepository {
  /**
   * Create a new device in the database
   *
   * @param deviceData - The device data to create
   * @returns The created device object
   */
  async create(deviceData: Prisma.DeviceCreateInput): Promise<Device> {
    return prisma.device.create({
      data: deviceData,
    });
  }

  /**
   * Find a device by ID
   *
   * @param id - The device ID to search for
   * @returns Device object if found, null otherwise
   */
  async findById(id: string): Promise<Device | null> {
    return prisma.device.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  /**
   * Find a device by device ID
   *
   * @param deviceId - The device ID to search for
   * @returns Device object if found, null otherwise
   */
  async findByDeviceId(deviceId: string): Promise<Device | null> {
    return prisma.device.findFirst({
      where: {
        deviceId,
        isDeleted: false,
      },
    });
  }

  /**
   * Find all devices for a specific user
   *
   * @param userId - The user ID to search for
   * @returns Array of devices belonging to the user
   */
  async findByUserId(userId: string): Promise<Device[]> {
    return prisma.device.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        paringDate: 'desc',
      },
    });
  }

  /**
   * Find all devices with pagination
   *
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns Array of devices
   */
  async findAll(skip: number = 0, take: number = 10): Promise<Device[]> {
    return prisma.device.findMany({
      where: {
        isDeleted: false,
      },
      skip,
      take,
      orderBy: {
        paringDate: 'desc',
      },
    });
  }

  /**
   * Update a device by ID
   *
   * @param id - The device ID to update
   * @param updateData - The data to update
   * @returns The updated device object
   */
  async update(
    id: string,
    updateData: Prisma.DeviceUpdateInput
  ): Promise<Device> {
    return prisma.device.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Soft delete a device by ID
   *
   * @param id - The device ID to delete
   * @returns The deleted device object
   */
  async delete(id: string): Promise<Device> {
    return prisma.device.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  /**
   * Count total devices
   *
   * @returns Total count of non-deleted devices
   */
  async count(): Promise<number> {
    return prisma.device.count({
      where: {
        isDeleted: false,
      },
    });
  }

  /**
   * Count devices for a specific user
   *
   * @param userId - The user ID
   * @returns Total count of devices for the user
   */
  async countByUserId(userId: string): Promise<number> {
    return prisma.device.count({
      where: {
        userId,
        isDeleted: false,
      },
    });
  }
}
