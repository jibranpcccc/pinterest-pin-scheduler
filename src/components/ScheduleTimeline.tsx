import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  format,
  startOfDay,
  endOfDay,
  parseISO,
  isBefore,
  isAfter,
} from 'date-fns'

interface ScheduleTimelineProps {
  selectedDate?: Date
  onPinClick?: (pinId: string) => void
}

export default function ScheduleTimeline({
  selectedDate = new Date(),
  onPinClick,
}: ScheduleTimelineProps) {
  const schedule = useSelector((state: RootState) => state.scheduler.schedule)
  const pendingPins = useSelector((state: RootState) => state.scheduler.pendingPins)
  const settings = useSelector((state: RootState) => state.settings)

  // Get scheduled pins for the selected day
  const daySchedule = useMemo(() => {
    const start = startOfDay(selectedDate)
    const end = endOfDay(selectedDate)
    
    return Object.entries(schedule)
      .filter(([_, dateStr]) => {
        const pinDate = parseISO(dateStr)
        return pinDate >= start && pinDate <= end
      })
      .map(([pinId, dateStr]) => ({
        id: pinId,
        time: parseISO(dateStr),
        pin: pendingPins.find((p) => p.id === pinId),
      }))
      .sort((a, b) => a.time.getTime() - b.time.getTime())
  }, [schedule, selectedDate, pendingPins])

  // Check if a time slot is within preferred ranges
  const isPreferredTime = (time: Date) => {
    const hour = time.getHours()
    const minute = time.getMinutes()
    const timeInMinutes = hour * 60 + minute

    return settings.preferredTimeRanges?.some((range) => {
      const [startHour, startMinute] = range.start.split(':').map(Number)
      const [endHour, endMinute] = range.end.split(':').map(Number)
      const rangeStart = startHour * 60 + startMinute
      const rangeEnd = endHour * 60 + endMinute

      return timeInMinutes >= rangeStart && timeInMinutes <= rangeEnd
    })
  }

  // Check scheduling conflicts
  const getConflicts = (pin: { time: Date }, index: number) => {
    const conflicts = []

    if (index > 0) {
      const prevPin = daySchedule[index - 1]
      const intervalMinutes =
        (pin.time.getTime() - prevPin.time.getTime()) / (1000 * 60)
      
      if (intervalMinutes < (settings.minIntervalMinutes || 15)) {
        conflicts.push('Too close to previous pin')
      }
    }

    if (!isPreferredTime(pin.time)) {
      conflicts.push('Outside preferred hours')
    }

    return conflicts
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">
        Schedule Timeline - {format(selectedDate, 'MMM d, yyyy')}
      </h3>

      <div className="space-y-4">
        {daySchedule.map((scheduledPin, index) => {
          const conflicts = getConflicts(scheduledPin, index)
          const isPast = isBefore(scheduledPin.time, new Date())
          const isNext = !isPast && index === daySchedule.findIndex(pin => isAfter(pin.time, new Date()))

          return (
            <div
              key={scheduledPin.id}
              onClick={() => onPinClick?.(scheduledPin.id)}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors
                ${isPast ? 'bg-gray-100' : 'bg-white'}
                ${isNext ? 'border-2 border-primary-500' : 'border border-gray-200'}
                ${conflicts.length > 0 ? 'border-red-200' : ''}
                hover:bg-gray-50
              `}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {format(scheduledPin.time, 'h:mm a')}
                </div>
                <div className="text-sm text-gray-500">
                  {isPast ? 'Posted' : isNext ? 'Next' : 'Scheduled'}
                </div>
              </div>

              {scheduledPin.pin && (
                <div className="mt-2 text-sm text-gray-600">
                  {scheduledPin.pin.boardIds.length} board(s)
                </div>
              )}

              {conflicts.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {conflicts.map((conflict, i) => (
                    <div key={i}>⚠️ {conflict}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {daySchedule.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No pins scheduled for this day
          </div>
        )}
      </div>
    </div>
  )
}
