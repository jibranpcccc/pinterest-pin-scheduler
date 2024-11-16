import { PinterestService } from './pinterest'
import { CacheService } from './cache'

interface BatchOperation<T> {
  operation: 'create' | 'update' | 'delete' | 'schedule'
  data: T
}

interface PinOperation extends BatchOperation<{
  boardId: string
  title?: string
  description?: string
  link?: string
  imageUrl?: string
  altText?: string
  tags?: string[]
  scheduledTime?: string
  pinId?: string
}> {}

export class BatchService {
  private static instance: BatchService
  private pinterestService: PinterestService
  private cacheService: CacheService
  private readonly MAX_CONCURRENT = 5
  private readonly RATE_LIMIT_DELAY = 1000 // 1 second between operations

  private constructor() {
    this.pinterestService = PinterestService.getInstance()
    this.cacheService = CacheService.getInstance()
  }

  static getInstance(): BatchService {
    if (!BatchService.instance) {
      BatchService.instance = new BatchService()
    }
    return BatchService.instance
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async processInBatches<T>(
    items: T[],
    processor: (item: T) => Promise<any>
  ): Promise<{ results: any[]; errors: Error[] }> {
    const results: any[] = []
    const errors: Error[] = []
    
    for (let i = 0; i < items.length; i += this.MAX_CONCURRENT) {
      const batch = items.slice(i, i + this.MAX_CONCURRENT)
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await processor(item)
          results.push(result)
        } catch (error) {
          errors.push(error as Error)
        }
        await this.delay(this.RATE_LIMIT_DELAY)
      })
      
      await Promise.all(batchPromises)
    }

    return { results, errors }
  }

  async processPinOperations(
    accessToken: string,
    userId: string,
    operations: PinOperation[]
  ): Promise<{ results: any[]; errors: Error[] }> {
    const processor = async (operation: PinOperation) => {
      switch (operation.operation) {
        case 'create':
          const createResult = await this.pinterestService.createPin(
            accessToken,
            operation.data.boardId,
            {
              title: operation.data.title || '',
              description: operation.data.description,
              link: operation.data.link,
              imageUrl: operation.data.imageUrl || '',
              altText: operation.data.altText,
              tags: operation.data.tags,
            }
          )
          await this.cacheService.invalidatePinCache(userId)
          await this.cacheService.invalidateBoardCache(userId, operation.data.boardId)
          return createResult

        case 'update':
          if (!operation.data.pinId) {
            throw new Error('Pin ID is required for update operation')
          }
          const updateResult = await this.pinterestService.updatePin(
            accessToken,
            operation.data.pinId,
            {
              title: operation.data.title,
              description: operation.data.description,
              link: operation.data.link,
              altText: operation.data.altText,
              boardId: operation.data.boardId,
            }
          )
          await this.cacheService.invalidatePinCache(userId, operation.data.pinId)
          await this.cacheService.invalidateBoardCache(userId, operation.data.boardId)
          return updateResult

        case 'delete':
          if (!operation.data.pinId) {
            throw new Error('Pin ID is required for delete operation')
          }
          await this.pinterestService.deletePin(accessToken, operation.data.pinId)
          await this.cacheService.invalidatePinCache(userId, operation.data.pinId)
          await this.cacheService.invalidateBoardCache(userId, operation.data.boardId)
          return { pinId: operation.data.pinId, status: 'deleted' }

        case 'schedule':
          if (!operation.data.pinId || !operation.data.scheduledTime) {
            throw new Error('Pin ID and scheduled time are required for schedule operation')
          }
          const scheduleResult = await this.pinterestService.schedulePin(
            accessToken,
            operation.data.pinId,
            operation.data.scheduledTime
          )
          await this.cacheService.invalidatePinCache(userId, operation.data.pinId)
          return scheduleResult

        default:
          throw new Error(`Unsupported operation: ${operation.operation}`)
      }
    }

    return this.processInBatches(operations, processor)
  }

  async optimizeScheduling(
    operations: PinOperation[],
    timeSlots: string[],
    maxPinsPerSlot: number = 5
  ): Promise<PinOperation[]> {
    const scheduledOps = [...operations]
    let currentSlotIndex = 0

    // Only process operations that need scheduling
    const toSchedule = scheduledOps.filter(
      op => op.operation === 'create' || op.operation === 'schedule'
    )

    for (let i = 0; i < toSchedule.length; i++) {
      if (currentSlotIndex >= timeSlots.length) {
        currentSlotIndex = 0 // Wrap around to the beginning
      }

      const op = toSchedule[i]
      op.data.scheduledTime = timeSlots[currentSlotIndex]

      // Move to next slot after maxPinsPerSlot pins
      if ((i + 1) % maxPinsPerSlot === 0) {
        currentSlotIndex++
      }
    }

    return scheduledOps
  }
}
