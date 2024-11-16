import React, { useState } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface ScheduledPin {
  id: string
  title: string
  imageUrl: string
  scheduledTime: Date
  boardName: string
}

interface ScheduleCalendarProps {
  scheduledPins: ScheduledPin[]
  onSelectDate?: (date: Date) => void
  onSelectPin?: (pin: ScheduledPin) => void
}

export default function ScheduleCalendar({
  scheduledPins,
  onSelectDate,
  onSelectPin,
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const renderHeader = () => {
    const dateFormat = 'MMMM yyyy'

    return (
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <span className="text-lg font-semibold text-gray-900">
          {format(currentMonth, dateFormat)}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    )
  }

  const renderDays = () => {
    const dateFormat = 'EEEE'
    const days = []
    const startDate = startOfWeek(currentMonth)

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="text-sm font-medium text-gray-500 text-center py-2"
        >
          {format(addDays(startDate, i), dateFormat).substring(0, 3)}
        </div>
      )
    }

    return <div className="grid grid-cols-7">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDate = day
        const isCurrentMonth = isSameMonth(day, monthStart)
        const isToday = isSameDay(day, new Date())
        const isSelected = isSameDay(day, selectedDate)

        // Get pins scheduled for this day
        const dayPins = scheduledPins.filter((pin) =>
          isSameDay(new Date(pin.scheduledTime), currentDate)
        )

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] border border-gray-200 ${
              !isCurrentMonth ? 'bg-gray-50' : ''
            }`}
            onClick={() => {
              setSelectedDate(currentDate)
              onSelectDate?.(currentDate)
            }}
          >
            <div
              className={`p-2 ${isToday ? 'bg-blue-50' : ''} ${
                isSelected ? 'bg-blue-100' : ''
              }`}
            >
              <span
                className={`text-sm ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'font-bold' : ''}`}
              >
                {format(day, 'd')}
              </span>

              {/* Pins for the day */}
              <div className="mt-1 space-y-1">
                {dayPins.map((pin) => (
                  <button
                    key={pin.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectPin?.(pin)
                    }}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100">
                      <img
                        src={pin.imageUrl}
                        alt={pin.title}
                        className="w-6 h-6 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 truncate">
                          {pin.title}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {format(new Date(pin.scheduledTime), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      )
      days = []
    }
    return <div className="flex-1">{rows}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  )
}
