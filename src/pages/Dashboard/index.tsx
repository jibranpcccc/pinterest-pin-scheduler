import React from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  QueueListIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import PerformanceStats from '../../components/PerformanceStats'

const quickActions = [
  {
    name: 'Create New Pin',
    description: 'Design and schedule a new Pinterest pin',
    href: '/create',
    icon: PlusIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'View Queue',
    description: 'Manage your scheduled pins',
    href: '/queue',
    icon: QueueListIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Schedule',
    description: 'View and edit your pin schedule',
    href: '/schedule',
    icon: CalendarIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Analytics',
    description: 'Track your Pinterest performance',
    href: '/analytics',
    icon: ChartBarIcon,
    color: 'bg-orange-500',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your Pinterest Pin Scheduler
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${action.color}`}
            >
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">
                {action.name}
              </p>
              <p className="truncate text-sm text-gray-500">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Performance Stats */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Performance Overview
        </h2>
        <PerformanceStats timeRange="week" />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Add recent activity items here */}
          <div className="p-4 text-sm text-gray-500">
            No recent activity to display.
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Upcoming Schedule
          </h2>
          <Link
            to="/schedule"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Add upcoming schedule items here */}
          <div className="p-4 text-sm text-gray-500">
            No upcoming pins scheduled.
          </div>
        </div>
      </div>
    </div>
  )
}
