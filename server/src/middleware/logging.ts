import { Request, Response, NextFunction } from 'express'
import { LoggerService } from '../services/logger'

export function requestLogging(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger = LoggerService.getInstance()
  const startTime = Date.now()

  // Log the incoming request
  logger.logAPIRequest(req)

  // Override res.json to log response
  const originalJson = res.json
  res.json = function (body) {
    const responseTime = Date.now() - startTime
    logger.logAPIResponse(req, responseTime, res.statusCode)
    return originalJson.call(this, body)
  }

  next()
}

export function errorLogging(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger = LoggerService.getInstance()
  logger.logAPIError(req, error)
  next(error)
}
