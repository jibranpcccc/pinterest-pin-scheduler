import { EventEmitter } from 'events'
import { PinData } from '../types'
import { ApiService } from './api'
import { LoggerService } from './logger'
import { CacheService } from './cache'

interface Job {
  id: string
  type: 'pin_creation' | 'pin_scheduling' | 'analytics_sync'
  data: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  maxAttempts: number
  error?: Error
  createdAt: Date
  updatedAt: Date
}

export class JobProcessor extends EventEmitter {
  private static instance: JobProcessor
  private queue: Job[] = []
  private processing: boolean = false
  private maxConcurrent: number = 3
  private currentJobs: number = 0

  private constructor() {
    super()
    this.setupEventListeners()
  }

  public static getInstance(): JobProcessor {
    if (!JobProcessor.instance) {
      JobProcessor.instance = new JobProcessor()
    }
    return JobProcessor.instance
  }

  private setupEventListeners() {
    this.on('jobCompleted', (jobId: string) => {
      this.currentJobs--
      this.processNextJob()
      LoggerService.info(`Job ${jobId} completed successfully`)
    })

    this.on('jobFailed', (jobId: string, error: Error) => {
      this.currentJobs--
      this.processNextJob()
      LoggerService.error(`Job ${jobId} failed: ${error.message}`)
    })
  }

  public async addJob(
    type: Job['type'],
    data: any,
    options: Partial<Pick<Job, 'maxAttempts'>> = {}
  ): Promise<string> {
    const job: Job = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data,
      status: 'pending',
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.queue.push(job)
    LoggerService.info(`Added new job ${job.id} of type ${type}`)

    // Cache the job for persistence
    await CacheService.getInstance().set(`job:${job.id}`, job)

    if (!this.processing) {
      this.processNextJob()
    }

    return job.id
  }

  private async processNextJob() {
    if (this.currentJobs >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.processing = true
    const job = this.queue.shift()
    if (!job) {
      this.processing = false
      return
    }

    this.currentJobs++
    job.status = 'processing'
    job.attempts++
    job.updatedAt = new Date()

    try {
      await this.processJob(job)
      job.status = 'completed'
      this.emit('jobCompleted', job.id)
    } catch (error) {
      job.error = error as Error
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending'
        this.queue.push(job)
      } else {
        job.status = 'failed'
      }
      this.emit('jobFailed', job.id, error)
    }

    // Update job in cache
    await CacheService.getInstance().set(`job:${job.id}`, job)

    if (this.queue.length > 0) {
      this.processNextJob()
    } else {
      this.processing = false
    }
  }

  private async processJob(job: Job): Promise<void> {
    const api = ApiService.getInstance()

    switch (job.type) {
      case 'pin_creation':
        await this.processPinCreation(job.data)
        break

      case 'pin_scheduling':
        await this.processPinScheduling(job.data)
        break

      case 'analytics_sync':
        await this.processAnalyticsSync(job.data)
        break

      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }
  }

  private async processPinCreation(data: {
    pins: PinData[]
    boardId: string
  }): Promise<void> {
    const api = ApiService.getInstance()
    const { pins, boardId } = data

    // Process pins in batches
    const batchSize = 5
    for (let i = 0; i < pins.length; i += batchSize) {
      const batch = pins.slice(i, i + batchSize)
      await Promise.all(
        batch.map((pin) => api.createPin(boardId, pin))
      )
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Rate limiting
    }
  }

  private async processPinScheduling(data: {
    pinId: string
    scheduledTime: string
  }): Promise<void> {
    const api = ApiService.getInstance()
    await api.schedulePin(data.pinId, data.scheduledTime)
  }

  private async processAnalyticsSync(data: {
    boardId: string
    startDate: string
    endDate: string
  }): Promise<void> {
    const api = ApiService.getInstance()
    await api.getBoardAnalytics(data.boardId, {
      startDate: data.startDate,
      endDate: data.endDate,
      metrics: ['impressions', 'saves', 'clicks'],
    })
  }

  public getJobStatus(jobId: string): Promise<Job | null> {
    return CacheService.getInstance().get(`job:${jobId}`)
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    const index = this.queue.findIndex((job) => job.id === jobId)
    if (index !== -1) {
      this.queue.splice(index, 1)
      await CacheService.getInstance().del(`job:${jobId}`)
      LoggerService.info(`Job ${jobId} cancelled`)
      return true
    }
    return false
  }

  public getQueueStatus() {
    return {
      queueLength: this.queue.length,
      currentJobs: this.currentJobs,
      isProcessing: this.processing,
    }
  }
}
