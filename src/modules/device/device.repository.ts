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

  /**
   * Find all devices with filters and pagination (for admin)
   *
   * @param filters - Search and filter options
   * @param pagination - Pagination options
   * @returns Array of devices with user information
   */
  async findAllWithFilters(
    filters: {
      search?: string;
      filterBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    pagination: {
      skip: number;
      take: number;
    }
  ): Promise<Array<Device & { user: { name: string } }>> {
    const { search, filterBy, sortOrder } = filters;
    const { skip, take } = pagination;

    // Build where clause for search
    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { deviceId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { paringDate: 'desc' };

    if (filterBy === 'deviceStatus') {
      orderBy = { deviceStatus: sortOrder || 'desc' };
    } else if (filterBy === 'lastSync') {
      orderBy = { lastSync: sortOrder || 'desc' };
    }

    return prisma.device.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  /**
   * Count all devices matching the filters
   *
   * @param filters - Search and filter options
   * @returns Total count of devices
   */
  async countAllWithFilters(filters: { search?: string }): Promise<number> {
    const { search } = filters;

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { deviceId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return prisma.device.count({ where });
  }
}
