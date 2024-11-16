import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import {
  HomeIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Schedule', href: '/schedule', icon: CalendarIcon },
  { name: 'Boards', href: '/boards', icon: ClipboardDocumentListIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function Layout() {
  const location = useLocation()
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="min-h-full">
      <div className="bg-primary-600 pb-32">
        <nav className="border-b border-primary-300 border-opacity-25 bg-primary-600 lg:border-none">
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-primary-400 lg:border-opacity-25">
              <div className="flex items-center px-2 lg:px-0">
                <div className="flex-shrink-0">
                  <img
                    className="block h-8 w-8"
                    src="/pinterest.svg"
                    alt="Pinterest"
                  />
                </div>
                <div className="hidden lg:ml-10 lg:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`${
                            isActive
                              ? 'bg-primary-700 text-white'
                              : 'text-white hover:bg-primary-500 hover:bg-opacity-75'
                          } rounded-md py-2 px-3 text-sm font-medium`}
                        >
                          <div className="flex items-center space-x-2">
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="flex lg:hidden">
                {/* Mobile menu button */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-primary-600 p-2 text-primary-200 hover:bg-primary-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </button>
              </div>
              <div className="hidden lg:ml-4 lg:block">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user?.profileImage || '/default-avatar.png'}
                      alt={user?.name || 'User'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
