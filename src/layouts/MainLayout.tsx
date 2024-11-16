import React, { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  HomeIcon,
  QueueListIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import NotificationCenter from '../components/NotificationCenter'

interface MainLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Queue', href: '/queue', icon: QueueListIcon },
  { name: 'Schedule', href: '/schedule', icon: CalendarIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-600">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="Pinterest Pin Scheduler"
            />
            <span className="ml-2 text-white font-semibold">
              Pin Scheduler
            </span>
          </div>
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            {/* Create New Pin Button */}
            <div className="px-4 mb-6">
              <Link
                to="/create"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Pin
              </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-2 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${
                        isActive
                          ? 'bg-gray-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${
                          isActive
                            ? 'text-blue-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    John Doe
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    View Profile
                  </p>
                </div>
                <button className="ml-auto p-1 hover:bg-gray-100 rounded-full">
                  <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <div className="flex-1 px-4 flex justify-end">
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <NotificationCenter />

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                {/* Add profile dropdown here */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
