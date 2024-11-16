import React, { useState } from 'react'
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  ClockIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Profile', icon: UserCircleIcon },
  { name: 'Account', icon: KeyIcon },
  { name: 'Notifications', icon: BellIcon },
  { name: 'Scheduling', icon: ClockIcon },
  { name: 'Preferences', icon: Cog6ToothIcon },
  { name: 'Security', icon: ShieldCheckIcon },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: '',
    website: '',
    notifications: {
      email: true,
      push: true,
      scheduling: true,
      analytics: false,
    },
    scheduling: {
      maxPinsPerDay: 25,
      preferredTimes: [],
      timezone: 'UTC',
      autoSchedule: true,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      autoOptimize: true,
    },
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleToggle = (category: string, setting: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !prev[category as keyof typeof prev][setting],
      },
    }))
  }

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving settings:', formData)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = activeTab === item.name
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full
                    ${
                      isActive
                        ? 'bg-gray-50 text-blue-600'
                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      flex-shrink-0 -ml-1 mr-3 h-6 w-6
                      ${
                        isActive
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }
                    `}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          {activeTab === 'Profile' && (
            <section aria-labelledby="profile-settings">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <h2
                      id="profile-settings"
                      className="text-lg font-medium text-gray-900"
                    >
                      Profile
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your personal information
                    </p>
                  </div>

                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="website"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Notifications' && (
            <section aria-labelledby="notification-settings">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <h2
                      id="notification-settings"
                      className="text-lg font-medium text-gray-900"
                    >
                      Notification Preferences
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage how you receive notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(formData.notifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Receive {key} notifications
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleToggle('notifications', key)
                            }
                            type="button"
                            className={`
                              relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                              ${value ? 'bg-blue-600' : 'bg-gray-200'}
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                ${value ? 'translate-x-5' : 'translate-x-0'}
                              `}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Add more tab content sections */}
        </div>
      </div>
    </div>
  )
}
