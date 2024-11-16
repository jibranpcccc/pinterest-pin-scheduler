import winston from 'winston'
import { Request } from 'express'

export class LoggerService {
  private static instance: LoggerService
  private logger: winston.Logger

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'pinterest-scheduler' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    })

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      )
    }
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  private formatRequest(req: Request): object {
    return {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      userId: req.user?.id,
    }
  }

  info(message: string, meta?: object): void {
    this.logger.info(message, meta)
  }

  error(message: string, error: any, meta?: object): void {
    this.logger.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
      },
      ...meta,
    })
  }

  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta)
  }

  debug(message: string, meta?: object): void {
    this.logger.debug(message, meta)
  }

  // API specific logging methods
  logAPIRequest(req: Request, meta?: object): void {
    this.info('API Request', {
      request: this.formatRequest(req),
      ...meta,
    })
  }

  logAPIResponse(req: Request, responseTime: number, statusCode: number, meta?: object): void {
    this.info('API Response', {
      request: this.formatRequest(req),
      response: {
        statusCode,
        responseTime,
      },
      ...meta,
    })
  }

  logAPIError(req: Request, error: any, meta?: object): void {
    this.error('API Error', error, {
      request: this.formatRequest(req),
      ...meta,
    })
  }

  // Pinterest specific logging methods
  logPinterestAPICall(
    method: string,
    endpoint: string,
    userId: string,
    meta?: object
  ): void {
    this.info('Pinterest API Call', {
      method,
      endpoint,
      userId,
      ...meta,
    })
  }

  logPinterestAPIError(
    method: string,
    endpoint: string,
    userId: string,
    error: any,
    meta?: object
  ): void {
    this.error('Pinterest API Error', error, {
      method,
      endpoint,
      userId,
      ...meta,
    })
  }

  // Batch operation logging
  logBatchOperation(
    userId: string,
    operationType: string,
    batchSize: number,
    meta?: object
  ): void {
    this.info('Batch Operation', {
      userId,
      operationType,
      batchSize,
      ...meta,
    })
  }

  // Cache operation logging
  logCacheOperation(
    operation: 'get' | 'set' | 'delete' | 'flush',
    key: string,
    hit?: boolean,
    meta?: object
  ): void {
    this.debug('Cache Operation', {
      operation,
      key,
      hit,
      ...meta,
    })
  }
}
