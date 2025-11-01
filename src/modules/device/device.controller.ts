import { Request, Response } from 'express';
import { DeviceService } from './device.service.js';
import { CreateDeviceDTO } from './dtos/create-device.dto.js';
import { UpdateDeviceDTO } from './dtos/update-device.dto.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';

/**
 * Device Controller
 *
 * Handles HTTP requests for device endpoints.
 * Delegates business logic to DeviceService.
 */

export class DeviceController {
  private readonly deviceService: DeviceService;

  constructor() {
    this.deviceService = new DeviceService();
  }

  /**
   * Create a new device
   *
   * POST /api/devices
   *
   * @param req - Express request object with CreateDeviceDTO in body
   * @param res - Express response object
   */
  createDevice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: CreateDeviceDTO = req.body;

    const device = await this.deviceService.createDevice(data);

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: device,
    });
  });

  /**
   * Get a device by ID
   *
   * GET /api/devices/:id
   *
   * @param req - Express request object with id param
   * @param res - Express response object
   */
  getDeviceById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const device = await this.deviceService.getDeviceById(id);

    res.status(200).json({
      success: true,
      message: 'Device retrieved successfully',
      data: device,
    });
  });

  /**
   * Get all devices for a specific user
   *
   * GET /api/devices/user/:userId
   *
   * @param req - Express request object with userId param
   * @param res - Express response object
   */
  getDevicesByUserId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    const devices = await this.deviceService.getDevicesByUserId(userId);

    res.status(200).json({
      success: true,
      message: 'Devices retrieved successfully',
      data: devices,
    });
  });

  /**
   * Get all devices with pagination
   *
   * GET /api/devices?page=1&limit=10
   *
   * @param req - Express request object with optional query params (page, limit)
   * @param res - Express response object
   */
  getAllDevices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.deviceService.getAllDevices(page, limit);

    res.status(200).json({
      success: true,
      message: 'Devices retrieved successfully',
      data: result,
    });
  });

  /**
   * Update a device
   *
   * PATCH /api/devices/:id
   *
   * @param req - Express request object with id param and UpdateDeviceDTO in body
   * @param res - Express response object
   */
  updateDevice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: UpdateDeviceDTO = req.body;

    const device = await this.deviceService.updateDevice(id, data);

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device,
    });
  });

  /**
   * Delete a device
   *
   * DELETE /api/devices/:id
   *
   * @param req - Express request object with id param
   * @param res - Express response object
   */
  deleteDevice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const device = await this.deviceService.deleteDevice(id);

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully',
      data: device,
    });
  });

  /**
   * Increment device usage count
   *
   * POST /api/devices/:id/increment-usage
   *
   * @param req - Express request object with id param
   * @param res - Express response object
   */
  incrementUsageCount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const device = await this.deviceService.incrementUsageCount(id);

    res.status(200).json({
      success: true,
      message: 'Device usage count incremented successfully',
      data: device,
    });
  });
}
