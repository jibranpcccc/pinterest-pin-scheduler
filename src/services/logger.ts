export class LoggerService {
  private static instance: LoggerService

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  public static info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${message}`, ...args)
  }

  public static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args)
  }

  public static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args)
  }

  public static debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }
}
