import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';
import { env } from '../../config/env.js';

/**
 * Log Cleanup Utility
 *
 * Provides functions to clean up old log files based on retention policies.
 * Can be run manually or scheduled as a cron job.
 */

/**
 * Cleanup configuration interface
 */
export interface CleanupConfig {
  logDir: string;
  retentionDays: number;
  dryRun?: boolean;
}

/**
 * Default retention period in days
 */
const DEFAULT_RETENTION_DAYS = 30;

/**
 * Delete log folders older than the retention period
 *
 * @param config - Cleanup configuration
 * @returns Object with cleanup statistics
 *
 * @example
 * const stats = await cleanupOldLogs({ logDir: 'logs', retentionDays: 30 });
 * console.log(`Deleted ${stats.deletedFolders} folders, freed ${stats.freedBytes} bytes`);
 */
export async function cleanupOldLogs(
  config?: Partial<CleanupConfig>
): Promise<{
  deletedFolders: number;
  deletedFiles: number;
  freedBytes: number;
  errors: string[];
}> {
  const logDir = config?.logDir || env.LOG_DIR;
  const retentionDays = config?.retentionDays || DEFAULT_RETENTION_DAYS;
  const dryRun = config?.dryRun || false;

  const stats = {
    deletedFolders: 0,
    deletedFiles: 0,
    freedBytes: 0,
    errors: [] as string[],
  };

  try {
    const absoluteLogDir = path.isAbsolute(logDir)
      ? logDir
      : path.resolve(process.cwd(), logDir);

    if (!fs.existsSync(absoluteLogDir)) {
      logger.warn({ logDir: absoluteLogDir }, 'Log directory does not exist');
      return stats;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    logger.info(
      {
        logDir: absoluteLogDir,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
        dryRun,
      },
      'Starting log cleanup'
    );

    // Read all folders in log directory
    const folders = fs.readdirSync(absoluteLogDir);

    for (const folder of folders) {
      try {
        const folderPath = path.join(absoluteLogDir, folder);
        const stat = fs.statSync(folderPath);

        // Skip if not a directory
        if (!stat.isDirectory()) {
          continue;
        }

        // Check if folder name matches YYYYMMDD format
        if (!/^\d{8}$/.test(folder)) {
          logger.warn({ folder }, 'Skipping folder with invalid name format');
          continue;
        }

        // Parse folder date (YYYYMMDD)
        const year = parseInt(folder.substring(0, 4));
        const month = parseInt(folder.substring(4, 6)) - 1; // Month is 0-indexed
        const day = parseInt(folder.substring(6, 8));
        const folderDate = new Date(year, month, day);

        // Delete if older than retention period
        if (folderDate < cutoffDate) {
          const folderStats = await deleteFolderRecursive(folderPath, dryRun);
          stats.deletedFolders++;
          stats.deletedFiles += folderStats.deletedFiles;
          stats.freedBytes += folderStats.freedBytes;

          logger.info(
            {
              folder,
              folderDate: folderDate.toISOString(),
              deletedFiles: folderStats.deletedFiles,
              freedBytes: folderStats.freedBytes,
              dryRun,
            },
            dryRun ? 'Would delete log folder' : 'Deleted log folder'
          );
        }
      } catch (error) {
        const errorMsg = `Failed to process folder ${folder}: ${error}`;
        logger.error({ folder, err: error }, errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    logger.info(
      {
        deletedFolders: stats.deletedFolders,
        deletedFiles: stats.deletedFiles,
        freedBytes: stats.freedBytes,
        errors: stats.errors.length,
        dryRun,
      },
      'Log cleanup completed'
    );

    return stats;
  } catch (error) {
    logger.error({ err: error, logDir }, 'Log cleanup failed');
    throw error;
  }
}

/**
 * Delete a folder and all its contents recursively
 *
 * @param folderPath - Path to folder
 * @param dryRun - If true, only simulate deletion
 * @returns Deletion statistics
 */
async function deleteFolderRecursive(
  folderPath: string,
  dryRun: boolean
): Promise<{
  deletedFiles: number;
  freedBytes: number;
}> {
  const stats = {
    deletedFiles: 0,
    freedBytes: 0,
  };

  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const subStats = await deleteFolderRecursive(filePath, dryRun);
        stats.deletedFiles += subStats.deletedFiles;
        stats.freedBytes += subStats.freedBytes;
      } else {
        stats.deletedFiles++;
        stats.freedBytes += stat.size;

        if (!dryRun) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Delete the folder itself
    if (!dryRun) {
      fs.rmdirSync(folderPath);
    }

    return stats;
  } catch (error) {
    logger.error({ err: error, folderPath }, 'Failed to delete folder');
    throw error;
  }
}

/**
 * Get disk space used by logs
 *
 * @param logDir - Log directory path
 * @returns Object with disk usage statistics
 *
 * @example
 * const usage = await getLogDiskUsage('logs');
 * console.log(`Logs using ${usage.totalBytes} bytes across ${usage.totalFiles} files`);
 */
export async function getLogDiskUsage(logDir?: string): Promise<{
  totalFiles: number;
  totalFolders: number;
  totalBytes: number;
  oldestLog: string | null;
  newestLog: string | null;
}> {
  const absoluteLogDir = path.isAbsolute(logDir || env.LOG_DIR)
    ? logDir || env.LOG_DIR
    : path.resolve(process.cwd(), logDir || env.LOG_DIR);

  const stats = {
    totalFiles: 0,
    totalFolders: 0,
    totalBytes: 0,
    oldestLog: null as string | null,
    newestLog: null as string | null,
  };

  try {
    if (!fs.existsSync(absoluteLogDir)) {
      return stats;
    }

    const folders = fs.readdirSync(absoluteLogDir);

    for (const folder of folders) {
      const folderPath = path.join(absoluteLogDir, folder);
      const stat = fs.statSync(folderPath);

      if (!stat.isDirectory()) {
        continue;
      }

      stats.totalFolders++;

      // Track oldest and newest logs
      if (!stats.oldestLog || folder < stats.oldestLog) {
        stats.oldestLog = folder;
      }
      if (!stats.newestLog || folder > stats.newestLog) {
        stats.newestLog = folder;
      }

      // Count files and bytes
      const files = fs.readdirSync(folderPath);
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isFile()) {
          stats.totalFiles++;
          stats.totalBytes += fileStat.size;
        }
      }
    }

    return stats;
  } catch (error) {
    logger.error({ err: error, logDir: absoluteLogDir }, 'Failed to get log disk usage');
    throw error;
  }
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get cleanup recommendations based on current disk usage
 *
 * @param logDir - Log directory path
 * @returns Cleanup recommendations
 */
export async function getCleanupRecommendations(logDir?: string): Promise<{
  shouldCleanup: boolean;
  recommendations: string[];
  currentUsage: Awaited<ReturnType<typeof getLogDiskUsage>>;
}> {
  const usage = await getLogDiskUsage(logDir);
  const recommendations: string[] = [];
  let shouldCleanup = false;

  // Recommend cleanup if logs exceed 100MB
  if (usage.totalBytes > 100 * 1024 * 1024) {
    shouldCleanup = true;
    recommendations.push(
      `Logs are using ${formatBytes(usage.totalBytes)}. Consider running cleanup.`
    );
  }

  // Recommend cleanup if more than 1000 files
  if (usage.totalFiles > 1000) {
    shouldCleanup = true;
    recommendations.push(
      `Found ${usage.totalFiles} log files. Consider running cleanup.`
    );
  }

  // Check if oldest logs are very old (>60 days)
  if (usage.oldestLog) {
    const oldestYear = parseInt(usage.oldestLog.substring(0, 4));
    const oldestMonth = parseInt(usage.oldestLog.substring(4, 6)) - 1;
    const oldestDay = parseInt(usage.oldestLog.substring(6, 8));
    const oldestDate = new Date(oldestYear, oldestMonth, oldestDay);
    const daysSinceOldest = Math.floor(
      (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceOldest > 60) {
      shouldCleanup = true;
      recommendations.push(
        `Oldest logs are ${daysSinceOldest} days old. Consider running cleanup with retention period.`
      );
    }
  }

  if (!shouldCleanup) {
    recommendations.push('No cleanup needed at this time.');
  }

  return {
    shouldCleanup,
    recommendations,
    currentUsage: usage,
  };
}
