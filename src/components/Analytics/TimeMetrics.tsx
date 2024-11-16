import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface TimeData {
  hour: number
  day: string
  pins: number
  engagement: number
}

interface TimeMetricsProps {
  data: TimeData[]
  loading?: boolean
}

export default function TimeMetrics({ data, loading = false }: TimeMetricsProps) {
  // Process data for hourly distribution
  const hourlyData = Array(24)
    .fill(0)
    .map((_, hour) => {
      const hourPins = data.filter((d) => d.hour === hour)
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        pins: hourPins.reduce((sum, d) => sum + d.pins, 0),
        engagement: hourPins.reduce((sum, d) => sum + d.engagement, 0) / hourPins.length || 0,
      }
    })

  // Process data for daily distribution
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dailyData = days.map((day) => {
    const dayPins = data.filter((d) => d.day === day)
    return {
      day,
      pins: dayPins.reduce((sum, d) => sum + d.pins, 0),
      engagement: dayPins.reduce((sum, d) => sum + d.engagement, 0) / dayPins.length || 0,
    }
  })

  // Find peak times
  const peakHour = hourlyData.reduce((max, curr) =>
    curr.engagement > max.engagement ? curr : max
  )
  const peakDay = dailyData.reduce((max, curr) =>
    curr.engagement > max.engagement ? curr : max
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Peak Hour
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {loading ? '...' : peakHour.hour}
                    </div>
                    <div className="ml-2 text-sm text-gray-600">
                      {loading
                        ? ''
                        : `${peakHour.engagement.toFixed(2)}% engagement`}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Best Day
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {loading ? '...' : peakDay.day}
                    </div>
                    <div className="ml-2 text-sm text-gray-600">
                      {loading
                        ? ''
                        : `${peakDay.engagement.toFixed(2)}% engagement`}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5">
        {/* Hourly Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Hourly Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="pins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="engagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="pins"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#pins)"
                  name="Pins"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="engagement"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#engagement)"
                  name="Engagement %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Daily Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="dailyPins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="dailyEngagement"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="pins"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#dailyPins)"
                  name="Pins"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="engagement"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#dailyEngagement)"
                  name="Engagement %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
