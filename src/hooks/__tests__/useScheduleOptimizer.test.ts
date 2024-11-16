import { renderHook, act } from '@testing-library/react-hooks'
import { useScheduleOptimizer } from '../useScheduleOptimizer'
import { usePinterestApi } from '../usePinterestApi'
import moment from 'moment'

jest.mock('../usePinterestApi')

const mockAnalytics = {
  trends: [
    {
      date: '2024-01-01T10:00:00Z',
      impressions: 1000,
      saves: 50,
      clicks: 100,
    },
    {
      date: '2024-01-01T14:00:00Z',
      impressions: 2000,
      saves: 100,
      clicks: 200,
    },
    {
      date: '2024-01-01T18:00:00Z',
      impressions: 1500,
      saves: 75,
      clicks: 150,
    },
  ],
}

describe('useScheduleOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      getBoardAnalytics: jest.fn().mockResolvedValue(mockAnalytics),
      getPinAnalytics: jest.fn(),
    })
  })

  it('gets optimal time based on analytics', async () => {
    const { result } = renderHook(() => useScheduleOptimizer())

    let optimalTime: string
    await act(async () => {
      optimalTime = await result.current.getOptimalTime('board1')
    })

    expect(optimalTime).toBeDefined()
    const time = moment(optimalTime)
    expect(time.isValid()).toBe(true)
  })

  it('generates optimal schedule for multiple pins', async () => {
    const { result } = renderHook(() => useScheduleOptimizer())

    const constraints = {
      maxPinsPerDay: 5,
      minIntervalMinutes: 60,
      preferredTimeRanges: [{ start: '09:00', end: '21:00' }],
      timezone: 'UTC',
    }

    let schedule: string[]
    await act(async () => {
      schedule = await result.current.getOptimalSchedule('board1', 3, constraints)
    })

    expect(schedule).toHaveLength(3)
    schedule.forEach((time) => {
      expect(moment(time).isValid()).toBe(true)
    })

    // Check minimum interval
    for (let i = 1; i < schedule.length; i++) {
      const diff = moment(schedule[i]).diff(
        moment(schedule[i - 1]),
        'minutes'
      )
      expect(diff).toBeGreaterThanOrEqual(constraints.minIntervalMinutes)
    }
  })

  it('handles analytics loading error', async () => {
    const error = new Error('Failed to load analytics')
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      getBoardAnalytics: jest.fn().mockRejectedValue(error),
      getPinAnalytics: jest.fn(),
    })

    const { result } = renderHook(() => useScheduleOptimizer())

    let optimalTime: string
    await act(async () => {
      optimalTime = await result.current.getOptimalTime('board1')
    })

    // Should return fallback time
    expect(optimalTime).toBeDefined()
    expect(moment(optimalTime).isValid()).toBe(true)
  })

  it('respects preferred time ranges', async () => {
    const { result } = renderHook(() => useScheduleOptimizer())

    const constraints = {
      maxPinsPerDay: 5,
      minIntervalMinutes: 60,
      preferredTimeRanges: [{ start: '09:00', end: '17:00' }],
      timezone: 'UTC',
    }

    let schedule: string[]
    await act(async () => {
      schedule = await result.current.getOptimalSchedule('board1', 3, constraints)
    })

    schedule.forEach((time) => {
      const hour = moment(time).hour()
      expect(hour).toBeGreaterThanOrEqual(9)
      expect(hour).toBeLessThanOrEqual(17)
    })
  })

  it('handles maximum pins per day constraint', async () => {
    const { result } = renderHook(() => useScheduleOptimizer())

    const constraints = {
      maxPinsPerDay: 2,
      minIntervalMinutes: 60,
      preferredTimeRanges: [{ start: '09:00', end: '21:00' }],
      timezone: 'UTC',
    }

    let schedule: string[]
    await act(async () => {
      schedule = await result.current.getOptimalSchedule('board1', 4, constraints)
    })

    // Group by day
    const pinsByDay = schedule.reduce((acc, time) => {
      const day = moment(time).format('YYYY-MM-DD')
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Check that no day has more than maxPinsPerDay
    Object.values(pinsByDay).forEach((count) => {
      expect(count).toBeLessThanOrEqual(constraints.maxPinsPerDay)
    })
  })
})
