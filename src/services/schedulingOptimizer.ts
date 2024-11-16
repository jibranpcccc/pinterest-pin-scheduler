interface SchedulingConstraints {
  maxPinsPerDay: number
  minIntervalMinutes: number
  preferredTimeRanges: Array<{
    start: string // HH:mm format
    end: string // HH:mm format
  }>
  timezone: string
}

interface PinToSchedule {
  id: string
  boardIds: string[]
  estimatedEngagement?: number
}

export class SchedulingOptimizer {
  private constraints: SchedulingConstraints

  constructor(constraints: SchedulingConstraints) {
    this.constraints = constraints
  }

  private getTimeInMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private isTimeInRange(
    timeStr: string,
    ranges: Array<{ start: string; end: string }>
  ): boolean {
    const time = this.getTimeInMinutes(timeStr)
    return ranges.some(
      (range) =>
        time >= this.getTimeInMinutes(range.start) &&
        time <= this.getTimeInMinutes(range.end)
    )
  }

  private getNextAvailableSlot(
    currentSchedule: Map<string, string[]>,
    date: Date
  ): Date {
    const dateStr = date.toISOString().split('T')[0]
    const timeStr = date.toTimeString().slice(0, 5)

    // Check if we've hit the daily pin limit
    const pinsOnDate = currentSchedule.get(dateStr)?.length || 0
    if (pinsOnDate >= this.constraints.maxPinsPerDay) {
      // Move to next day at the start of preferred time
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      nextDate.setHours(
        Number(this.constraints.preferredTimeRanges[0].start.split(':')[0]),
        Number(this.constraints.preferredTimeRanges[0].start.split(':')[1]),
        0,
        0
      )
      return this.getNextAvailableSlot(currentSchedule, nextDate)
    }

    // Check if current time is within preferred ranges
    if (!this.isTimeInRange(timeStr, this.constraints.preferredTimeRanges)) {
      // Find next preferred time range
      for (const range of this.constraints.preferredTimeRanges) {
        const rangeStart = this.getTimeInMinutes(range.start)
        const currentTime = this.getTimeInMinutes(timeStr)
        if (rangeStart > currentTime) {
          date.setHours(
            Number(range.start.split(':')[0]),
            Number(range.start.split(':')[1]),
            0,
            0
          )
          return date
        }
      }
      // If no more ranges today, move to tomorrow
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      nextDate.setHours(
        Number(this.constraints.preferredTimeRanges[0].start.split(':')[0]),
        Number(this.constraints.preferredTimeRanges[0].start.split(':')[1]),
        0,
        0
      )
      return this.getNextAvailableSlot(currentSchedule, nextDate)
    }

    return date
  }

  optimizeSchedule(
    pins: PinToSchedule[],
    startTime: Date,
    existingSchedule: Map<string, string[]> = new Map()
  ): Map<string, Date> {
    const schedule = new Map<string, Date>()
    let currentTime = new Date(startTime)

    // Sort pins by estimated engagement if available
    const sortedPins = [...pins].sort((a, b) => {
      if (a.estimatedEngagement && b.estimatedEngagement) {
        return b.estimatedEngagement - a.estimatedEngagement
      }
      return 0
    })

    for (const pin of sortedPins) {
      // Find next available slot
      currentTime = this.getNextAvailableSlot(existingSchedule, currentTime)

      // Schedule the pin
      schedule.set(pin.id, new Date(currentTime))

      // Update existing schedule
      const dateStr = currentTime.toISOString().split('T')[0]
      const existingPins = existingSchedule.get(dateStr) || []
      existingSchedule.set(dateStr, [...existingPins, pin.id])

      // Add minimum interval
      currentTime.setMinutes(
        currentTime.getMinutes() + this.constraints.minIntervalMinutes
      )
    }

    return schedule
  }

  validateSchedule(schedule: Map<string, Date>): {
    isValid: boolean
    violations: string[]
  } {
    const violations: string[] = []
    const pinsByDate = new Map<string, Date[]>()

    // Group pins by date
    schedule.forEach((date, pinId) => {
      const dateStr = date.toISOString().split('T')[0]
      const existing = pinsByDate.get(dateStr) || []
      pinsByDate.set(dateStr, [...existing, date])
    })

    // Check violations
    pinsByDate.forEach((dates, dateStr) => {
      // Check daily limit
      if (dates.length > this.constraints.maxPinsPerDay) {
        violations.push(
          `Date ${dateStr} has ${dates.length} pins, exceeding limit of ${this.constraints.maxPinsPerDay}`
        )
      }

      // Check intervals
      dates.sort((a, b) => a.getTime() - b.getTime())
      for (let i = 1; i < dates.length; i++) {
        const interval =
          (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60)
        if (interval < this.constraints.minIntervalMinutes) {
          violations.push(
            `Interval between pins on ${dateStr} is ${interval} minutes, below minimum ${this.constraints.minIntervalMinutes}`
          )
        }
      }

      // Check preferred time ranges
      dates.forEach((date) => {
        const timeStr = date.toTimeString().slice(0, 5)
        if (!this.isTimeInRange(timeStr, this.constraints.preferredTimeRanges)) {
          violations.push(
            `Pin scheduled at ${timeStr} on ${dateStr} is outside preferred time ranges`
          )
        }
      })
    })

    return {
      isValid: violations.length === 0,
      violations,
    }
  }
}
