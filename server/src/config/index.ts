import dotenv from 'dotenv'
import { LoggerService } from '../services/logger'

// Load environment variables
dotenv.config()

const logger = LoggerService.getInstance()

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    const error = `Missing required environment variable: ${key}`
    logger.error(error, new Error(error))
    throw new Error(error)
  }
  return value
}

const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  client: {
    origin: requireEnv('CLIENT_ORIGIN'),
  },

  pinterest: {
    clientId: requireEnv('PINTEREST_CLIENT_ID'),
    clientSecret: requireEnv('PINTEREST_CLIENT_SECRET'),
    redirectUri: requireEnv('PINTEREST_REDIRECT_URI'),
    apiUrl: process.env.PINTEREST_API_URL || 'https://api.pinterest.com/v5',
    scope: process.env.PINTEREST_SCOPE || 'boards:read,pins:read,pins:write',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '60', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
} as const

// Validate configuration
function validateConfig() {
  const errors: string[] = []

  // Validate server configuration
  if (config.server.port < 0 || config.server.port > 65535) {
    errors.push('Invalid PORT: must be between 0 and 65535')
  }

  // Validate cache configuration
  if (config.cache.ttl <= 0) {
    errors.push('Invalid CACHE_TTL: must be greater than 0')
  }
  if (config.cache.checkPeriod <= 0) {
    errors.push('Invalid CACHE_CHECK_PERIOD: must be greater than 0')
  }

  // Validate rate limit configuration
  if (config.rateLimit.windowMs <= 0) {
    errors.push('Invalid RATE_LIMIT_WINDOW_MS: must be greater than 0')
  }
  if (config.rateLimit.maxRequests <= 0) {
    errors.push('Invalid RATE_LIMIT_MAX_REQUESTS: must be greater than 0')
  }

  // Validate Pinterest configuration
  if (!config.pinterest.clientId.match(/^[a-zA-Z0-9_-]+$/)) {
    errors.push('Invalid PINTEREST_CLIENT_ID format')
  }
  if (!config.pinterest.clientSecret.match(/^[a-zA-Z0-9_-]+$/)) {
    errors.push('Invalid PINTEREST_CLIENT_SECRET format')
  }
  if (!config.pinterest.redirectUri.startsWith('http')) {
    errors.push('Invalid PINTEREST_REDIRECT_URI: must be a valid URL')
  }

  if (errors.length > 0) {
    const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`
    logger.error(errorMessage, new Error(errorMessage))
    throw new Error(errorMessage)
  }

  logger.info('Configuration validated successfully', { config })
}

try {
  validateConfig()
} catch (error) {
  logger.error('Configuration validation failed', error)
  process.exit(1)
}

export { config }
