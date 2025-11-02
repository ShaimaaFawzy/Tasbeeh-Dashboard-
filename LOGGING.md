# Logging System Documentation

## Overview

This project uses **Pino** for high-performance logging with support for both console and file output. Logs are automatically organized by date and rotated hourly for easy management.

## Features

- ✅ **Console & File Logging**: Toggle between console-only, file-only, or both
- ✅ **Hourly Rotation**: Logs rotate automatically every hour
- ✅ **Organized Structure**: Logs organized in date folders (YYYYMMDD/HH.log)
- ✅ **Pretty Print**: Human-readable format in development
- ✅ **JSON Format**: Structured logs in production
- ✅ **Request Tracking**: Automatic request ID generation and tracking
- ✅ **Sensitive Data Redaction**: Passwords and tokens automatically removed
- ✅ **Context Binding**: Child loggers with persistent context
- ✅ **Performance Monitoring**: Log slow operations automatically
- ✅ **Cleanup Utilities**: Tools to manage old log files

## Log Directory Structure

Logs are stored at the project root level:

```
project-root/
├── logs/
│   ├── 20250102/              # January 2, 2025
│   │   ├── 00.log            # Midnight to 1am
│   │   ├── 01.log            # 1am to 2am
│   │   ├── 14.log            # 2pm to 3pm
│   │   └── 23.log            # 11pm to midnight
│   ├── 20250103/             # January 3, 2025
│   │   ├── 00.log
│   │   └── ...
│   └── ...
├── src/
└── ...
```

**Naming Convention:**
- Folder: `YYYYMMDD` (e.g., `20250102` for January 2, 2025)
- File: `HH.log` (e.g., `00.log`, `14.log`, `23.log`)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Logging Configuration
LOG_TO_FILE=true         # Enable/disable file logging
LOG_TO_CONSOLE=true      # Enable/disable console logging
LOG_LEVEL=debug          # Log level (fatal, error, warn, info, debug, trace)
LOG_DIR=logs             # Log directory path (relative or absolute)
```

### Configuration Behavior

| LOG_TO_FILE | LOG_TO_CONSOLE | Behavior |
|-------------|----------------|----------|
| `true` | `true` | Logs to both file and console |
| `true` | `false` | Logs to file only |
| `false` | `true` | Logs to console only |
| `false` | `false` | Defaults to console (with warning) |

### Log Levels

Available log levels (from highest to lowest priority):

1. `fatal` - Application crashes
2. `error` - Errors that need attention
3. `warn` - Warning messages
4. `info` - General information (default)
5. `debug` - Debugging information
6. `trace` - Very detailed debugging

**Environment-Based Defaults:**

- **Development**: `LOG_LEVEL=debug`
- **Production**: `LOG_LEVEL=info`

## Usage Examples

### Basic Logging

```typescript
import { logger } from '@/shared/utils/logger';

// Info level
logger.info('Application started successfully');

// With additional context
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Error with stack trace
logger.error({ err: error }, 'Failed to process request');

// Warning
logger.warn({ count: 5 }, 'Retry count exceeded threshold');

// Debug (only in development)
logger.debug({ data: payload }, 'Processing payload');
```

### Child Loggers with Context

Create loggers with persistent context:

```typescript
import { createChildLogger } from '@/shared/utils/logger';

// Create logger with module context
const authLogger = createChildLogger({
  module: 'auth-service',
  version: '1.0.0'
});

authLogger.info('Processing authentication');
// Automatically includes module and version in all logs

// Service-specific logger
const userService = createChildLogger({
  module: 'user-service',
  userId: '123'
});

userService.info('Fetching user data');
userService.warn('User data incomplete');
```

### Request Logging

Automatically track requests with context:

```typescript
import { getRequestLogger } from '@/shared/utils/logger';

// In a controller or middleware
export const handleRequest = async (req: Request, res: Response) => {
  const reqLogger = getRequestLogger(req);

  reqLogger.info('Processing request');
  // Automatically includes requestId, method, url, ip, userId (if authenticated)

  try {
    const result = await processData();
    reqLogger.info({ result }, 'Request completed successfully');
  } catch (error) {
    reqLogger.error({ err: error }, 'Request failed');
  }
};
```

### Measure Operation Performance

Automatically log slow operations:

```typescript
import { measureOperation } from '@/shared/utils/logger';

// Measure and log database query
const users = await measureOperation(
  'fetchUsers',
  async () => {
    return await database.users.findMany();
  },
  { limit: 100 }
);

// If operation takes > 1s, automatically logs warning/error
```

### Manual Slow Operation Logging

```typescript
import { logSlowOperation } from '@/shared/utils/logger';

const start = Date.now();
await someOperation();
const duration = Date.now() - start;

logSlowOperation('someOperation', duration, 1000, { context: 'value' });
// Logs if duration > 1000ms (1 second)
```

## Log Format

### Development (Console - Pretty Print)

```
[14:30:45.123] INFO (12345): User logged in
    userId: "123"
    email: "user@example.com"
    method: "POST"
    url: "/api/auth/login"
```

### Production (File - JSON)

```json
{
  "level": 30,
  "time": 1704182400000,
  "pid": 12345,
  "hostname": "server-1",
  "requestId": "req_1704182400_abc123",
  "userId": "123",
  "method": "POST",
  "url": "/api/auth/login",
  "msg": "User logged in"
}
```

## Log Cleanup

### Manual Cleanup

Delete logs older than 30 days:

```typescript
import { cleanupOldLogs } from '@/shared/utils/log-cleanup';

const stats = await cleanupOldLogs({
  retentionDays: 30,
  dryRun: false  // Set to true for simulation
});

console.log(`Deleted ${stats.deletedFolders} folders`);
console.log(`Freed ${stats.freedBytes} bytes`);
```

### Check Disk Usage

```typescript
import { getLogDiskUsage, formatBytes } from '@/shared/utils/log-cleanup';

const usage = await getLogDiskUsage();

console.log(`Total files: ${usage.totalFiles}`);
console.log(`Total size: ${formatBytes(usage.totalBytes)}`);
console.log(`Oldest log: ${usage.oldestLog}`);
console.log(`Newest log: ${usage.newestLog}`);
```

### Cleanup Recommendations

```typescript
import { getCleanupRecommendations } from '@/shared/utils/log-cleanup';

const recommendations = await getCleanupRecommendations();

if (recommendations.shouldCleanup) {
  console.log('Cleanup recommended:');
  recommendations.recommendations.forEach(r => console.log(`- ${r}`));
}
```

### Scheduled Cleanup (Example)

```typescript
// In your application startup or cron job
import { cleanupOldLogs } from '@/shared/utils/log-cleanup';

// Run cleanup daily at midnight
setInterval(async () => {
  try {
    await cleanupOldLogs({ retentionDays: 30 });
    logger.info('Log cleanup completed');
  } catch (error) {
    logger.error({ err: error }, 'Log cleanup failed');
  }
}, 24 * 60 * 60 * 1000); // 24 hours
```

## Sensitive Data Redaction

The logger automatically redacts sensitive fields:

- `password`
- `token`
- `accessToken`
- `refreshToken`
- `secret`
- `req.headers.authorization`
- `req.headers.cookie`

**Example:**

```typescript
logger.info({
  username: 'john',
  password: 'secret123'  // Will be redacted
}, 'User login attempt');

// Logged as:
{
  "username": "john",
  "password": "[Redacted]",
  "msg": "User login attempt"
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ❌ Bad
logger.info({ err: error }, 'Database connection failed');

// ✅ Good
logger.error({ err: error }, 'Database connection failed');
```

### 2. Include Relevant Context

```typescript
// ❌ Bad
logger.info('User updated');

// ✅ Good
logger.info({ userId: '123', fields: ['email', 'name'] }, 'User updated');
```

### 3. Use Child Loggers for Modules

```typescript
// ❌ Bad - Repeating context in every log
logger.info({ module: 'auth' }, 'Login attempt');
logger.info({ module: 'auth' }, 'Login success');

// ✅ Good - Context automatically included
const authLogger = createChildLogger({ module: 'auth' });
authLogger.info('Login attempt');
authLogger.info('Login success');
```

### 4. Log Errors with Stack Traces

```typescript
// ❌ Bad
logger.error(`Error: ${error.message}`);

// ✅ Good
logger.error({ err: error }, 'Operation failed');
```

### 5. Don't Log in Loops

```typescript
// ❌ Bad - Excessive logging
users.forEach(user => {
  logger.debug({ user }, 'Processing user');
});

// ✅ Good - Log summary
logger.info({ count: users.length }, 'Processing users');
```

## Viewing Logs

### View Real-Time Logs

**Development (Console):**
```bash
npm run dev
```

**Production (File):**
```bash
# View current hour's log
tail -f logs/$(date +%Y%m%d)/$(date +%H).log

# View with pretty formatting (requires pino-pretty CLI)
tail -f logs/$(date +%Y%m%d)/$(date +%H).log | npx pino-pretty
```

### Search Logs

```bash
# Search for specific term in today's logs
grep "error" logs/$(date +%Y%m%d)/*.log

# Search across all logs
grep -r "userId.*123" logs/

# Search JSON logs with jq
cat logs/20250102/14.log | jq 'select(.level >= 40)'  # Errors only
```

## Troubleshooting

### Logs Not Appearing in Files

1. **Check environment variables:**
   ```bash
   echo $LOG_TO_FILE  # Should be "true"
   ```

2. **Check directory permissions:**
   ```bash
   ls -la logs/
   ```

3. **Check application logs for errors:**
   ```
   [Logger] Failed to create log directory
   [Logger] Failed to enable file logging
   ```

### Log Directory Not Created

The directory is created automatically on first log. If it fails:

```typescript
import { ensureLogDirectoryExists } from '@/config/logger.config';

ensureLogDirectoryExists('logs');
```

### Logs Taking Too Much Space

Run cleanup:

```typescript
import { cleanupOldLogs } from '@/shared/utils/log-cleanup';

await cleanupOldLogs({ retentionDays: 7 });  // Keep only last week
```

## File Structure

```
src/
├── config/
│   └── logger.config.ts          # Logger configuration & streams
├── shared/
│   └── utils/
│       ├── logger.ts             # Main logger & utilities
│       └── log-cleanup.ts        # Cleanup utilities
└── app.ts                        # pino-http integration
```

## Advanced Configuration

### Custom Log Directory

```env
# Absolute path
LOG_DIR=/var/log/tasbeeh

# Relative path (from project root)
LOG_DIR=logs
```

### Production vs Development

**.env.development:**
```env
LOG_TO_FILE=true
LOG_TO_CONSOLE=true
LOG_LEVEL=debug
```

**.env.production:**
```env
LOG_TO_FILE=true
LOG_TO_CONSOLE=false
LOG_LEVEL=info
```

### Compression (Optional)

To enable gzip compression of old logs, modify `logger.config.ts`:

```typescript
const stream = createStream(generateLogFilename, {
  path: absoluteLogDir,
  interval: '1h',
  compress: 'gzip',  // Enable compression
});
```

## Performance

- **Pino** is one of the fastest Node.js loggers
- File writes are asynchronous and non-blocking
- Minimal performance impact on application
- Hourly rotation prevents large file issues

## Summary

The logging system provides comprehensive, performant logging with minimal configuration. It automatically handles:

- ✅ File rotation (hourly)
- ✅ Organized log structure
- ✅ Request tracking
- ✅ Sensitive data redaction
- ✅ Context binding
- ✅ Performance monitoring
- ✅ Error serialization

Just configure your `.env` file and start logging!
