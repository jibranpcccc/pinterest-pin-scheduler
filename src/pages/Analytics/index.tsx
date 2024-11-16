import React, { useState } from 'react'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import PerformanceStats from '../../components/PerformanceStats'
import EngagementMetrics from '../../components/Analytics/EngagementMetrics'
import BoardMetrics from '../../components/Analytics/BoardMetrics'
import TimeMetrics from '../../components/Analytics/TimeMetrics'

const tabs = [
  {
    name: 'Overview',
    icon: ChartBarIcon,
  },
  {
    name: 'Engagement',
    icon: ArrowTrendingUpIcon,
  },
  {
    name: 'Boards',
    icon: UsersIcon,
  },
  {
    name: 'Timing',
    icon: ClockIcon,
  },
]

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [timeRange, setTimeRange] = useState<
    'day' | 'week' | 'month' | 'year'
  >('week')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and analyze your Pinterest performance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.name
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${
                    activeTab === tab.name
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {['day', 'week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range as any)}
            className={`
              px-3 py-1 text-sm font-medium rounded-md
              ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'Overview' && (
          <>
            <PerformanceStats timeRange={timeRange} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Top Performing Pins
                </h3>
                {/* Add top pins component */}
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Growth
                </h3>
                {/* Add growth chart component */}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Engagement' && (
          <EngagementMetrics timeRange={timeRange} />
        )}

        {activeTab === 'Boards' && <BoardMetrics timeRange={timeRange} />}

        {activeTab === 'Timing' && <TimeMetrics timeRange={timeRange} />}
      </div>

      {/* Export Options */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Export Analytics
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Download your analytics data in various formats</p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
