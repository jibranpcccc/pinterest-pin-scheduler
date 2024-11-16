import { JobProcessor } from '../jobProcessor'
import { ApiService } from '../api'
import { CacheService } from '../cache'

jest.mock('../api')
jest.mock('../cache')

describe('JobProcessor', () => {
  let jobProcessor: JobProcessor

  beforeEach(() => {
    jest.clearAllMocks()
    jobProcessor = JobProcessor.getInstance()
  })

  it('creates a singleton instance', () => {
    const instance1 = JobProcessor.getInstance()
    const instance2 = JobProcessor.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('adds a job to the queue', async () => {
    const jobId = await jobProcessor.addJob('pin_creation', {
      pins: [],
      boardId: '123',
    })

    expect(jobId).toBeDefined()
    expect(typeof jobId).toBe('string')

    const status = await jobProcessor.getJobStatus(jobId)
    expect(status).toBeDefined()
    expect(status?.status).toBe('pending')
  })

  it('processes pin creation jobs in batches', async () => {
    const mockCreatePin = jest.fn().mockResolvedValue({})
    ;(ApiService.getInstance as jest.Mock).mockReturnValue({
      createPin: mockCreatePin,
    })

    const pins = Array(10)
      .fill(null)
      .map((_, i) => ({
        title: `Pin ${i}`,
        imageUrl: `https://example.com/image${i}.jpg`,
      }))

    const jobId = await jobProcessor.addJob('pin_creation', {
      pins,
      boardId: '123',
    })

    // Wait for job processing
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockCreatePin).toHaveBeenCalledTimes(10)
  })

  it('handles job failures and retries', async () => {
    const mockCreatePin = jest
      .fn()
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({})

    ;(ApiService.getInstance as jest.Mock).mockReturnValue({
      createPin: mockCreatePin,
    })

    const jobId = await jobProcessor.addJob(
      'pin_creation',
      {
        pins: [{ title: 'Test Pin', imageUrl: 'https://example.com/image.jpg' }],
        boardId: '123',
      },
      { maxAttempts: 2 }
    )

    // Wait for job processing and retry
    await new Promise((resolve) => setTimeout(resolve, 200))

    const status = await jobProcessor.getJobStatus(jobId)
    expect(status?.attempts).toBe(2)
    expect(status?.status).toBe('completed')
  })

  it('respects maximum concurrent jobs', async () => {
    const mockSchedulePin = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 50))
    )

    ;(ApiService.getInstance as jest.Mock).mockReturnValue({
      schedulePin: mockSchedulePin,
    })

    // Add more jobs than maxConcurrent
    const jobPromises = Array(5)
      .fill(null)
      .map((_, i) =>
        jobProcessor.addJob('pin_scheduling', {
          pinId: `pin${i}`,
          scheduledTime: new Date().toISOString(),
        })
      )

    const jobIds = await Promise.all(jobPromises)

    // Check queue status immediately
    const status = jobProcessor.getQueueStatus()
    expect(status.currentJobs).toBeLessThanOrEqual(3) // maxConcurrent is 3

    // Wait for all jobs to complete
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Verify all jobs were processed
    const finalStatuses = await Promise.all(
      jobIds.map((id) => jobProcessor.getJobStatus(id))
    )
    finalStatuses.forEach((status) => {
      expect(status?.status).toBe('completed')
    })
  })

  it('cancels pending jobs', async () => {
    const jobId = await jobProcessor.addJob('analytics_sync', {
      boardId: '123',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })

    const cancelled = await jobProcessor.cancelJob(jobId)
    expect(cancelled).toBe(true)

    const status = await jobProcessor.getJobStatus(jobId)
    expect(status).toBeNull()
  })

  it('maintains job state in cache', async () => {
    const mockSet = jest.fn()
    const mockGet = jest.fn()
    ;(CacheService.getInstance as jest.Mock).mockReturnValue({
      set: mockSet,
      get: mockGet,
    })

    await jobProcessor.addJob('pin_scheduling', {
      pinId: '123',
      scheduledTime: new Date().toISOString(),
    })

    expect(mockSet).toHaveBeenCalled()
    expect(mockSet.mock.calls[0][0]).toMatch(/^job:/)
  })
})
