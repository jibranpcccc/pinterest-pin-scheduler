export class CacheService {
  private static instance: CacheService
  private cache: Map<string, any>

  private constructor() {
    this.cache = new Map()
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  public async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value)
  }

  public async get(key: string): Promise<any> {
    return this.cache.get(key)
  }

  public async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  public async clear(): Promise<void> {
    this.cache.clear()
  }

  public async has(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  public async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  public async values(): Promise<any[]> {
    return Array.from(this.cache.values())
  }

  public async entries(): Promise<[string, any][]> {
    return Array.from(this.cache.entries())
  }

  public async size(): Promise<number> {
    return this.cache.size
  }
}
