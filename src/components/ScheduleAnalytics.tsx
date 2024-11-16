import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  format,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  parseISO,
  isWithinInterval,
} from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface ScheduleAnalyticsProps {
  selectedDate?: Date
}

export default function ScheduleAnalytics({
  selectedDate = new Date(),
}: ScheduleAnalyticsProps) {
  const schedule = useSelector((state: RootState) => state.scheduler.schedule)
  const settings = useSelector((state: RootState) => state.settings)

  // Get hourly pin distribution
  const hourlyData = useMemo(() => {
    const start = startOfDay(selectedDate)
    const end = endOfDay(selectedDate)
    const hours = eachHourOfInterval({ start, end })

    // Initialize data for each hour
    const data = hours.map((hour) => ({
      hour: format(hour, 'HH:00'),
      pins: 0,
    }))

    // Count pins for each hour
    Object.values(schedule).forEach((dateStr) => {
      const pinDate = parseISO(dateStr)
      if (isWithinInterval(pinDate, { start, end })) {
        const hourIndex = pinDate.getHours()
        data[hourIndex].pins++
      }
    })

    return data
  }, [schedule, selectedDate])

  // Calculate daily statistics
  const dailyStats = useMemo(() => {
    const start = startOfDay(selectedDate)
    const end = endOfDay(selectedDate)
    const pinsToday = Object.values(schedule).filter((dateStr) => {
      const pinDate = parseISO(dateStr)
      return isWithinInterval(pinDate, { start, end })
    })

    return {
      total: pinsToday.length,
      remaining: settings.maxPinsPerDay - pinsToday.length,
    }
  }, [schedule, selectedDate, settings.maxPinsPerDay])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Schedule Analytics for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Pins</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {dailyStats.total}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Remaining Slots</p>
            <p className="mt-1 text-2xl font-semibold text-green-900">
              {dailyStats.remaining}
            </p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 12 }}
              interval={2}
              tickFormatter={(value) => format(parseISO(`2000-01-01T${value}`), 'ha')}
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [`${value} pins`, 'Scheduled']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Bar
              dataKey="pins"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {dailyStats.remaining < 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-600">
            Warning: You have exceeded the maximum pins per day limit by{' '}
            {Math.abs(dailyStats.remaining)} pins.
          </p>
        </div>
      )}
    </div>
  )
}
