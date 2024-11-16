import React from 'react'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'

interface Stat {
  name: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ElementType
}

interface PerformanceStatsProps {
  timeRange: 'day' | 'week' | 'month' | 'year'
  onTimeRangeChange?: (range: string) => void
}

export default function PerformanceStats({
  timeRange,
  onTimeRangeChange,
}: PerformanceStatsProps) {
  // Mock stats data - replace with actual data
  const stats: Stat[] = [
    {
      name: 'Total Views',
      value: 2847,
      change: 12.5,
      changeType: 'increase',
      icon: EyeIcon,
    },
    {
      name: 'Engagement Rate',
      value: 4.2,
      change: 2.1,
      changeType: 'decrease',
      icon: ChartBarIcon,
    },
    {
      name: 'Saves',
      value: 487,
      change: 28.3,
      changeType: 'increase',
      icon: HeartIcon,
    },
    {
      name: 'Comments',
      value: 156,
      change: 5.4,
      changeType: 'increase',
      icon: ChatBubbleLeftIcon,
    },
  ]

  const timeRanges = ['day', 'week', 'month', 'year']

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange?.(range)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              timeRange === range
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                        {stat.name === 'Engagement Rate' && '%'}
                      </div>

                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.changeType === 'increase' ? (
                          <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                        )}
                        <span className="ml-1">{stat.change}%</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Mini Sparkline Chart */}
            <div className="bg-gray-50 px-5 py-3">
              <div className="h-8">
                {/* Add sparkline chart here */}
                <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Performance Insights
          </h3>
          <div className="mt-6 flow-root">
            <ul className="-mb-8">
              {[
                {
                  title: 'Peak Engagement Time',
                  description:
                    'Your pins receive the most engagement between 2 PM and 4 PM',
                  type: 'insight',
                },
                {
                  title: 'Top Performing Board',
                  description:
                    '"Design Inspiration" board has 45% higher engagement',
                  type: 'success',
                },
                {
                  title: 'Content Opportunity',
                  description:
                    'Consider creating more infographic-style pins',
                  type: 'suggestion',
                },
              ].map((item, itemIdx) => (
                <li key={itemIdx}>
                  <div className="relative pb-8">
                    {itemIdx !== 2 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            item.type === 'insight'
                              ? 'bg-blue-500'
                              : item.type === 'success'
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }`}
                        >
                          <ChartBarIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
