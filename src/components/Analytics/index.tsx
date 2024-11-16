import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ChartBarIcon,
  ClockIcon,
  HashtagIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Analytics() {
  const { scheduledPins } = useSelector((state: RootState) => state.scheduler)
  const { boards } = useSelector((state: RootState) => state.boards)

  // Calculate pin distribution by hour
  const pinsByHour = Array(24).fill(0)
  scheduledPins.forEach(pin => {
    const hour = new Date(pin.scheduledTime).getHours()
    pinsByHour[hour]++
  })

  const hourlyData = pinsByHour.map((count, hour) => ({
    hour: `${hour}:00`,
    pins: count,
  }))

  // Calculate pin distribution by board
  const pinsByBoard = scheduledPins.reduce((acc, pin) => {
    pin.boardIds.forEach(boardId => {
      acc[boardId] = (acc[boardId] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const boardData = Object.entries(pinsByBoard).map(([boardId, count]) => ({
    name: boards.find(b => b.id === boardId)?.name || 'Unknown',
    value: count,
  }))

  // Calculate weekly distribution
  const today = new Date()
  const weeklyData = Array(7)
    .fill(0)
    .map((_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const count = scheduledPins.filter(pin => {
        const pinDate = new Date(pin.scheduledTime)
        return (
          pinDate.getDate() === date.getDate() &&
          pinDate.getMonth() === date.getMonth()
        )
      }).length
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        pins: count,
      }
    })

  // Calculate summary statistics
  const stats = {
    totalPins: scheduledPins.length,
    uniqueBoards: new Set(scheduledPins.flatMap(pin => pin.boardIds)).size,
    avgPinsPerDay:
      Math.round(
        (scheduledPins.length / (weeklyData.filter(d => d.pins > 0).length || 1)) * 10
      ) / 10,
    peakHour:
      hourlyData.reduce(
        (max, curr) => (curr.pins > max.pins ? curr : max),
        hourlyData[0]
      ).hour,
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HashtagIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Pins
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalPins}
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
                <ChartPieIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Unique Boards
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.uniqueBoards}
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
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Pins/Day
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.avgPinsPerDay}
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
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Peak Hour
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.peakHour}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Hourly Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Hourly Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="pins"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Weekly Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pins" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Board Distribution */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Board Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={boardData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180
                    const radius = 25 + innerRadius + (outerRadius - innerRadius)
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#666"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {boardData[index].name} ({value})
                      </text>
                    )
                  }}
                >
                  {boardData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
