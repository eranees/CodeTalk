# Logging with Winston

This project uses Winston for structured logging instead of console.log statements.

## Log Levels

- **error**: Error messages
- **warn**: Warning messages  
- **info**: General information
- **http**: HTTP requests (if using morgan)
- **debug**: Debug information (only in development)

## Log Outputs

### Console Output
- Colored output with timestamps
- Format: `YYYY-MM-DD HH:mm:ss:ms LEVEL: message`

### File Output
- **`logs/error.log`**: Only error level logs in JSON format
- **`logs/combined.log`**: All log levels in JSON format

## Usage

### In Code
```typescript
import logger from './config/logger';

// Log levels
logger.error('Error message');
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message');
```

### Available Scripts

```bash
# View all logs in real-time
pnpm run logs

# View only error logs in real-time
pnpm run logs:error

# Clear all log files
pnpm run logs:clear
```

## Configuration

The logger is configured in `src/config/logger.ts`:

- **Development**: Shows debug level and above
- **Production**: Shows warn level and above
- **Console**: Colored output with timestamps
- **Files**: JSON format for structured logging

## Log Rotation

For production, consider adding log rotation using `winston-daily-rotate-file`:

```bash
pnpm add winston-daily-rotate-file
```

## Environment Variables

- `NODE_ENV`: Controls log level (development = debug, production = warn)

## Log Files Location

- `backend/logs/error.log` - Error logs only
- `backend/logs/combined.log` - All logs

## Git Ignore

Log files are automatically ignored by git (see `.gitignore`).
