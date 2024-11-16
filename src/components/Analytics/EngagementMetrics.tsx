import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

interface EngagementData {
  date: string
  impressions: number
  clicks: number
  saves: number
}

interface EngagementMetricsProps {
  data: EngagementData[]
  loading?: boolean
}

export default function EngagementMetrics({
  data,
  loading = false,
}: EngagementMetricsProps) {
  // Calculate trend percentages
  const calculateTrend = (metric: keyof Omit<EngagementData, 'date'>) => {
    if (data.length < 2) return 0
    const latest = data[data.length - 1][metric]
    const previous = data[data.length - 2][metric]
    return previous === 0 ? 0 : ((latest - previous) / previous) * 100
  }

  const trends = {
    impressions: calculateTrend('impressions'),
    clicks: calculateTrend('clicks'),
    saves: calculateTrend('saves'),
  }

  return (
    <div className="space-y-6">
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Impressions
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {loading
                        ? '...'
                        : data.length > 0
                        ? data[data.length - 1].impressions.toLocaleString()
                        : '0'}
                    </div>
                    {trends.impressions !== 0 && (
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          trends.impressions > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        <ArrowTrendingUpIcon
                          className={`self-center flex-shrink-0 h-4 w-4 ${
                            trends.impressions > 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="ml-1">
                          {Math.abs(trends.impressions).toFixed(1)}%
                        </span>
                      </div>
                    )}
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
                <ChartBarIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Clicks
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {loading
                        ? '...'
                        : data.length > 0
                        ? data[data.length - 1].clicks.toLocaleString()
                        : '0'}
                    </div>
                    {trends.clicks !== 0 && (
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          trends.clicks > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        <ArrowTrendingUpIcon
                          className={`self-center flex-shrink-0 h-4 w-4 ${
                            trends.clicks > 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="ml-1">
                          {Math.abs(trends.clicks).toFixed(1)}%
                        </span>
                      </div>
                    )}
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
                <ChartBarIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Saves
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {loading
                        ? '...'
                        : data.length > 0
                        ? data[data.length - 1].saves.toLocaleString()
                        : '0'}
                    </div>
                    {trends.saves !== 0 && (
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          trends.saves > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        <ArrowTrendingUpIcon
                          className={`self-center flex-shrink-0 h-4 w-4 ${
                            trends.saves > 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="ml-1">
                          {Math.abs(trends.saves).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Engagement Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="saves"
                stroke="#8b5cf6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
