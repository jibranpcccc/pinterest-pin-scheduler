import moment from 'moment-timezone'
import { useState, useCallback } from 'react'
import { usePinterestApi } from './usePinterestApi'
import { PinAnalytics } from '../types'

interface TimeSlot {
  time: string
  score: number
  engagementRate: number
  totalImpressions: number
}

interface ScheduleConstraints {
  maxPinsPerDay: number
  preferredTimeRange?: {
    start: string // HH:mm format
    end: string // HH:mm format
  }
  timezone?: string
  minIntervalMinutes: number
}

export function useScheduleOptimizer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getBoardAnalytics, getPinAnalytics } = usePinterestApi()

  const analyzeTimeSlots = (analytics: PinAnalytics[]): TimeSlot[] => {
    const slots: { [key: string]: TimeSlot } = {}

    // Group analytics by hour
    analytics.forEach((data) => {
      const hour = moment(data.date).format('HH:00')
      if (!slots[hour]) {
        slots[hour] = {
          time: hour,
          score: 0,
          engagementRate: 0,
          totalImpressions: 0,
        }
      }

      const engagementRate = (data.saves + data.clicks) / data.impressions
      slots[hour].engagementRate +=
        engagementRate / (analytics.length / 24) // Normalize by days
      slots[hour].totalImpressions += data.impressions
    })

    // Calculate scores
    return Object.values(slots).map((slot) => ({
      ...slot,
      score:
        slot.engagementRate * 0.7 + // 70% weight on engagement
        (slot.totalImpressions / Math.max(...Object.values(slots).map((s) => s.totalImpressions))) *
          0.3, // 30% weight on impressions
    }))
  }

  const getOptimalTime = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const analytics = await getBoardAnalytics('', {
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
        metrics: ['impressions', 'saves', 'clicks'],
      })

      // Find the hour with highest engagement
      const hourlyEngagement = Array(24).fill(0)
      analytics.forEach((data) => {
        const hour = moment(data.date).hour()
        hourlyEngagement[hour] += data.impressions + data.saves * 2 + data.clicks * 3
      })

      const maxEngagementHour = hourlyEngagement.indexOf(
        Math.max(...hourlyEngagement)
      )

      // Set the optimal time to the next occurrence of the best hour
      const selectedTime = moment()
        .hour(maxEngagementHour)
        .minute(0)
        .second(0)

      // If the time has passed today, set it for tomorrow
      if (selectedTime.isBefore(moment())) {
        selectedTime.add(1, 'day')
      }

      return selectedTime.toISOString()
    } catch (error) {
      console.error('Failed to get optimal time:', error)
      // Fallback to next hour if optimization fails
      return moment()
        .add(1, 'hour')
        .minute(0)
        .second(0)
        .toISOString()
    } finally {
      setLoading(false)
    }
  }, [getBoardAnalytics])

  const getOptimalSchedule = useCallback(
    async (
      pinCount: number,
      constraints: ScheduleConstraints = { maxPinsPerDay: 5, minIntervalMinutes: 30 }
    ) => {
      setLoading(true)
      setError(null)

      try {
        const analytics = await getBoardAnalytics('', {
          startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
          endDate: moment().format('YYYY-MM-DD'),
          metrics: ['impressions', 'saves', 'clicks'],
        })

        // Initialize schedule array
        const schedule: string[] = []
        const timezone = constraints.timezone || moment.tz.guess()

        // Calculate hourly engagement scores
        const hourlyEngagement = Array(24).fill(0)
        analytics.forEach((data) => {
          const hour = moment(data.date).tz(timezone).hour()
          hourlyEngagement[hour] += data.impressions + data.saves * 2 + data.clicks * 3
        })

        // Sort hours by engagement score
        const sortedHours = hourlyEngagement
          .map((score, hour) => ({ hour, score }))
          .sort((a, b) => b.score - a.score)

        // Filter hours based on preferred time range
        let availableHours = sortedHours
        if (constraints.preferredTimeRange) {
          const { start, end } = constraints.preferredTimeRange
          const startHour = parseInt(start.split(':')[0])
          const endHour = parseInt(end.split(':')[0])
          availableHours = sortedHours.filter(({ hour }) => {
            if (startHour <= endHour) {
              return hour >= startHour && hour <= endHour
            } else {
              // Handle overnight ranges (e.g., 22:00-06:00)
              return hour >= startHour || hour <= endHour
            }
          })
        }

        // Generate schedule
        let currentDate = moment().tz(timezone)
        let pinsScheduledToday = 0

        for (let i = 0; i < pinCount; i++) {
          // Reset daily counter if day changes
          if (pinsScheduledToday >= constraints.maxPinsPerDay) {
            currentDate = currentDate.add(1, 'day').startOf('day')
            pinsScheduledToday = 0
          }

          // Get next best hour
          const bestHour = availableHours[i % availableHours.length].hour

          // Set schedule time
          const scheduleTime = moment(currentDate)
            .tz(timezone)
            .hour(bestHour)
            .minute(Math.floor(Math.random() * 60))
            .second(0)

          // If time has passed today, move to tomorrow
          if (scheduleTime.isBefore(moment())) {
            scheduleTime.add(1, 'day')
          }

          schedule.push(scheduleTime.toISOString())
          pinsScheduledToday++
        }

        return schedule
      } catch (error) {
        console.error('Failed to generate schedule:', error)
        // Fallback to simple scheduling
        return Array.from({ length: pinCount }, (_, i) =>
          moment()
            .add(i + 1, 'hour')
            .toISOString()
        )
      } finally {
        setLoading(false)
      }
    },
    [getBoardAnalytics]
  )

  return {
    getOptimalTime,
    getOptimalSchedule,
    loading,
    error,
  }
}
