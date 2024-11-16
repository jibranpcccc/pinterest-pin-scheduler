import { Request, Response } from 'express'
import { PinterestService } from '../services/pinterest'
import { CacheService } from '../services/cache'
import { BatchService } from '../services/batch'
import { z } from 'zod'

export class PinterestController {
  private static instance: PinterestController
  private pinterestService: PinterestService
  private cacheService: CacheService
  private batchService: BatchService

  private constructor() {
    this.pinterestService = PinterestService.getInstance()
    this.cacheService = CacheService.getInstance()
    this.batchService = BatchService.getInstance()
  }

  static getInstance(): PinterestController {
    if (!PinterestController.instance) {
      PinterestController.instance = new PinterestController()
    }
    return PinterestController.instance
  }

  async getBoards(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const accessToken = req.user?.accessToken

      if (!userId || !accessToken) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const cacheKey = this.cacheService.generateBoardKey(userId)
      const cachedBoards = await this.cacheService.get(cacheKey)

      if (cachedBoards) {
        res.json(cachedBoards)
        return
      }

      const boards = await this.pinterestService.getBoards(accessToken)
      await this.cacheService.set(cacheKey, boards)
      res.json(boards)
    } catch (error) {
      this.handleError(error, res, 'Failed to get boards')
    }
  }

  async createBoard(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const response = await this.pinterestService.createBoard(
        accessToken,
        req.body
      )
      res.json(response)
    } catch (error: any) {
      this.handleError(error, res, 'Failed to create board')
    }
  }

  async deleteBoard(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const { boardId } = req.params
      await this.pinterestService.deleteBoard(accessToken, boardId)
      res.status(204).send()
    } catch (error: any) {
      this.handleError(error, res, 'Failed to delete board')
    }
  }

  async createPin(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const { boardId, ...pinData } = req.body
      const response = await this.pinterestService.createPin(
        accessToken,
        boardId,
        pinData
      )
      res.json(response)
    } catch (error: any) {
      this.handleError(error, res, 'Failed to create pin')
    }
  }

  async updatePin(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const { pinId } = req.params
      const response = await this.pinterestService.updatePin(
        accessToken,
        pinId,
        req.body
      )
      res.json(response)
    } catch (error: any) {
      this.handleError(error, res, 'Failed to update pin')
    }
  }

  async deletePin(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const { pinId } = req.params
      await this.pinterestService.deletePin(accessToken, pinId)
      res.status(204).send()
    } catch (error: any) {
      this.handleError(error, res, 'Failed to delete pin')
    }
  }

  async schedulePin(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const { pinId, scheduledTime } = req.body
      const response = await this.pinterestService.schedulePin(
        accessToken,
        pinId,
        scheduledTime
      )
      res.json(response)
    } catch (error: any) {
      this.handleError(error, res, 'Failed to schedule pin')
    }
  }

  async getPinAnalytics(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const { pinId } = req.params
      const { startDate, endDate, metrics } = req.query as {
        startDate: string
        endDate: string
        metrics: string[]
      }

      const response = await this.pinterestService.getPinAnalytics(
        accessToken,
        pinId,
        startDate,
        endDate,
        metrics
      )
      res.json(response)
    } catch (error: any) {
      this.handleError(error, res, 'Failed to get pin analytics')
    }
  }

  async getBoardAnalytics(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessToken(req)
      const { boardId } = req.params
      const { startDate, endDate, metrics } = req.query as {
        startDate: string
        endDate: string
        metrics: string[]
      }

      const response = await this.pinterestService.getBoardAnalytics(
        accessToken,
        boardId,
        startDate,
        endDate,
        metrics
      )
      res.json(response)
    } catch (error: any) {
      this.handleError(error, res, 'Failed to get board analytics')
    }
  }

  async batchPinOperations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const accessToken = req.user?.accessToken

      if (!userId || !accessToken) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const schema = z.object({
        operations: z.array(
          z.object({
            operation: z.enum(['create', 'update', 'delete', 'schedule']),
            data: z.object({
              boardId: z.string(),
              title: z.string().optional(),
              description: z.string().optional(),
              link: z.string().url().optional(),
              imageUrl: z.string().url().optional(),
              altText: z.string().optional(),
              tags: z.array(z.string()).optional(),
              scheduledTime: z.string().optional(),
              pinId: z.string().optional(),
            }),
          })
        ),
        optimizeScheduling: z.boolean().optional(),
        timeSlots: z.array(z.string()).optional(),
        maxPinsPerSlot: z.number().optional(),
      })

      const { operations, optimizeScheduling, timeSlots, maxPinsPerSlot } = schema.parse(req.body)

      let processedOperations = operations
      if (optimizeScheduling && timeSlots) {
        processedOperations = await this.batchService.optimizeScheduling(
          operations,
          timeSlots,
          maxPinsPerSlot
        )
      }

      const result = await this.batchService.processPinOperations(
        accessToken,
        userId,
        processedOperations
      )

      res.json(result)
    } catch (error) {
      this.handleError(error, res, 'Failed to batch pin operations')
    }
  }

  private getAccessToken(req: Request): string {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw { status: 401, message: 'No access token provided' }
    }
    return authHeader.split(' ')[1]
  }

  private handleError(error: any, res: Response, defaultMessage: string) {
    console.error(`${defaultMessage}:`, error)
    res.status(error.status || 500).json({
      error: defaultMessage,
      details: error.message,
    })
  }
}
