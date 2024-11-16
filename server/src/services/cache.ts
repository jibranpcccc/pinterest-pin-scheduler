import NodeCache from 'node-cache'
import { LoggerService } from './logger'

export class CacheService {
  private static instance: CacheService
  private cache: NodeCache
  private logger: LoggerService

  private constructor() {
    this.logger = LoggerService.getInstance()
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 60, // Check for expired keys every 60 seconds
    })

    // Log cache events
    this.cache.on('set', (key) => {
      this.logger.logCacheOperation('set', key)
    })

    this.cache.on('del', (key) => {
      this.logger.logCacheOperation('delete', key)
    })

    this.cache.on('expired', (key) => {
      this.logger.logCacheOperation('delete', key, undefined, { reason: 'expired' })
    })

    this.cache.on('flush', () => {
      this.logger.logCacheOperation('flush', 'all')
    })
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = this.cache.get<T>(key)
    this.logger.logCacheOperation('get', key, value !== undefined)
    return value
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = 300 // 5 minutes default
  ): Promise<void> {
    this.cache.set(key, value, ttl)
  }

  async delete(key: string): Promise<void> {
    this.cache.del(key)
  }

  async flush(): Promise<void> {
    this.cache.flushAll()
  }

  generateKey(parts: string[]): string {
    return parts.join(':')
  }

  // Specialized methods for Pinterest data
  generateBoardKey(userId: string, boardId?: string): string {
    return this.generateKey(['boards', userId, boardId || 'all'])
  }

  generatePinKey(userId: string, pinId?: string): string {
    return this.generateKey(['pins', userId, pinId || 'all'])
  }

  generateAnalyticsKey(
    type: 'pin' | 'board',
    id: string,
    metrics: string[],
    startDate: string,
    endDate: string
  ): string {
    return this.generateKey([
      'analytics',
      type,
      id,
      metrics.sort().join(','),
      startDate,
      endDate,
    ])
  }

  // Cache invalidation methods
  async invalidateBoardCache(userId: string, boardId?: string): Promise<void> {
    const pattern = this.generateBoardKey(userId, boardId)
    const keys = this.cache.keys().filter(key => key.startsWith(pattern))
    keys.forEach(key => this.cache.del(key))
    this.logger.logCacheOperation('delete', pattern, undefined, { 
      type: 'pattern',
      keysDeleted: keys.length 
    })
  }

  async invalidatePinCache(userId: string, pinId?: string): Promise<void> {
    const pattern = this.generatePinKey(userId, pinId)
    const keys = this.cache.keys().filter(key => key.startsWith(pattern))
    keys.forEach(key => this.cache.del(key))
    this.logger.logCacheOperation('delete', pattern, undefined, { 
      type: 'pattern',
      keysDeleted: keys.length 
    })
  }

  async invalidateAnalyticsCache(type: 'pin' | 'board', id: string): Promise<void> {
    const pattern = this.generateKey(['analytics', type, id])
    const keys = this.cache.keys().filter(key => key.startsWith(pattern))
    keys.forEach(key => this.cache.del(key))
    this.logger.logCacheOperation('delete', pattern, undefined, { 
      type: 'pattern',
      keysDeleted: keys.length 
    })
  }
}
