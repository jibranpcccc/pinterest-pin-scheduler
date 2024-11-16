import React, { useState, useEffect } from 'react'
import { format, addDays, startOfDay, addHours, isBefore } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface DateTimePickerProps {
  value: Date
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledTimes?: string[]
}

export default function DateTimePicker({
  value,
  onChange,
  minDate = new Date(),
  maxDate = addDays(new Date(), 30),
  disabledTimes = [],
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(value))
  const [selectedTime, setSelectedTime] = useState(format(value, 'HH:mm'))

  useEffect(() => {
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const newDate = addHours(addHours(selectedDate, hours), minutes / 60)
    onChange(newDate)
  }, [selectedDate, selectedTime])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const isTimeDisabled = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const dateWithTime = addHours(addHours(selectedDate, hours), minutes / 60)
    return (
      disabledTimes.includes(time) ||
      isBefore(dateWithTime, minDate) ||
      (maxDate && isBefore(maxDate, dateWithTime))
    )
  }

  const generateDays = () => {
    const days = []
    let currentDate = startOfDay(new Date())

    while (days.length < 30) {
      if (!isBefore(maxDate, currentDate)) {
        days.push(currentDate)
      }
      currentDate = addDays(currentDate, 1)
    }

    return days
  }

  const handlePreviousDay = () => {
    const newDate = addDays(selectedDate, -1)
    if (!isBefore(newDate, minDate)) {
      setSelectedDate(newDate)
    }
  }

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1)
    if (!maxDate || !isBefore(maxDate, newDate)) {
      setSelectedDate(newDate)
    }
  }

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePreviousDay}
          disabled={isBefore(addDays(selectedDate, -1), minDate)}
          className="p-1 rounded-full text-gray-400 hover:text-gray-500 disabled:opacity-50"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="flex space-x-2 overflow-x-auto">
          {generateDays().map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${
                  format(date, 'yyyy-MM-dd') ===
                  format(selectedDate, 'yyyy-MM-dd')
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {format(date, 'MMM d')}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          disabled={maxDate && isBefore(maxDate, addDays(selectedDate, 1))}
          className="p-1 rounded-full text-gray-400 hover:text-gray-500 disabled:opacity-50"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Time Selection */}
      <div className="grid grid-cols-4 gap-2">
        {generateTimeSlots().map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            disabled={isTimeDisabled(time)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium
              ${
                time === selectedTime
                  ? 'bg-blue-100 text-blue-800'
                  : isTimeDisabled(time)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {time}
          </button>
        ))}
      </div>

      {/* Selected Date/Time Display */}
      <div className="text-sm text-gray-500">
        Selected: {format(value, 'PPp')}
      </div>
    </div>
  )
}
