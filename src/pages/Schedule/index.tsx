import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import ScheduleCalendar from '../../components/ScheduleCalendar'
import PinPreview from '../../components/PinPreview'

interface ScheduledPin {
  id: string
  title: string
  imageUrl: string
  boardName: string
  scheduledTime: Date
  metrics?: {
    views: number
    saves: number
    comments: number
  }
}

export default function Schedule() {
  const [selectedPin, setSelectedPin] = useState<ScheduledPin | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Mock data
  const scheduledPins: ScheduledPin[] = [
    {
      id: '1',
      title: 'Summer Design Trends',
      imageUrl: 'https://via.placeholder.com/300x450',
      boardName: 'Design Inspiration',
      scheduledTime: new Date(),
      metrics: {
        views: 1234,
        saves: 56,
        comments: 12,
      },
    },
    // Add more scheduled pins
  ]

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedPin(null)
  }

  const handlePinSelect = (pin: ScheduledPin) => {
    setSelectedPin(pin)
  }

  return (
    <div className="h-full">
      <div className="flex h-full">
        {/* Main Calendar */}
        <div className="flex-1 min-w-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Schedule
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Plan and organize your Pinterest content calendar
                </p>
              </div>
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Pin
              </Link>
            </div>

            {/* Calendar */}
            <div className="flex-1 overflow-auto">
              <ScheduleCalendar
                scheduledPins={scheduledPins}
                onSelectDate={handleDateSelect}
                onSelectPin={handlePinSelect}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block lg:flex-shrink-0 lg:w-96">
          <div className="h-full border-l border-gray-200 bg-white">
            {selectedPin ? (
              <div className="h-full flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Pin Details
                    </h2>
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close panel</span>
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-4">
                    <PinPreview
                      title={selectedPin.title}
                      imageUrl={selectedPin.imageUrl}
                      metrics={selectedPin.metrics}
                    />
                    <div className="mt-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Board
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedPin.boardName}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Scheduled Time
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedPin.scheduledTime.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                          Edit
                        </button>
                        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedDate ? (
              <div className="h-full flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      {selectedDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close panel</span>
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {scheduledPins
                        .filter(
                          (pin) =>
                            pin.scheduledTime.toDateString() ===
                            selectedDate.toDateString()
                        )
                        .map((pin) => (
                          <button
                            key={pin.id}
                            onClick={() => handlePinSelect(pin)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50">
                              <img
                                src={pin.imageUrl}
                                alt={pin.title}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {pin.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {pin.scheduledTime.toLocaleTimeString()}
                                </p>
                              </div>
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      <Link
                        to="/create"
                        className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Schedule New Pin
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <img
                  src="/calendar-illustration.svg"
                  alt="Select a date"
                  className="w-48 h-48 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900">
                  No Date Selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a date to view or schedule pins
                </p>
                <Link
                  to="/create"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Pin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
