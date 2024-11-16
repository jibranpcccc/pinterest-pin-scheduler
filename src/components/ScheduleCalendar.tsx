import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface ScheduleCalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date | null
}

export default function ScheduleCalendar({
  onDateSelect,
  selectedDate,
}: ScheduleCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const schedule = useSelector((state: RootState) => state.scheduler.schedule)
  const settings = useSelector((state: RootState) => state.settings)

  // Get pins scheduled for each day
  const pinsByDay = useMemo(() => {
    const days = new Map<string, number>()
    
    Object.values(schedule).forEach((dateStr) => {
      const date = parseISO(dateStr)
      const dayKey = format(date, 'yyyy-MM-dd')
      days.set(dayKey, (days.get(dayKey) || 0) + 1)
    })

    return days
  }, [schedule])

  // Get week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Start from Monday
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentWeek])

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1))
  }

  const getDayStatus = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd')
    const pinCount = pinsByDay.get(dayKey) || 0
    const isOverLimit = pinCount > settings.maxPinsPerDay

    return {
      pinCount,
      isOverLimit,
      hasScheduledPins: pinCount > 0,
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Schedule Calendar
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousWeek}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-900">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {weekDays.map((day) => {
          const { pinCount, isOverLimit, hasScheduledPins } = getDayStatus(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect?.(day)}
              className={`
                p-2 rounded-lg text-sm relative
                ${isSelected ? 'bg-blue-100 text-blue-900' : ''}
                ${!isSelected && isToday ? 'bg-gray-50' : ''}
                ${hasScheduledPins ? 'font-medium' : ''}
                hover:bg-gray-50
              `}
            >
              <span className={isOverLimit ? 'text-red-600' : ''}>
                {format(day, 'd')}
              </span>
              {pinCount > 0 && (
                <span
                  className={`
                    absolute bottom-1 right-1 h-2 w-2 rounded-full
                    ${isOverLimit ? 'bg-red-400' : 'bg-blue-400'}
                  `}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <span>Has pins</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span>Over limit</span>
        </div>
      </div>
    </div>
  )
}
