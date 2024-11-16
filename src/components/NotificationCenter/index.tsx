import React, { useState, useEffect } from 'react'
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
}

interface NotificationCenterProps {
  onActionClick?: (notification: Notification) => void
  onClear?: () => void
  onMarkAllRead?: () => void
}

export default function NotificationCenter({
  onActionClick,
  onClear,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock notifications - replace with actual data fetching
  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Pin Published Successfully',
        message: 'Your pin "Summer Design Trends" has been published.',
        timestamp: new Date(),
        read: false,
        actionUrl: '/analytics/pins/123',
        actionText: 'View Analytics',
      },
      {
        id: '2',
        type: 'warning',
        title: 'Scheduling Conflict',
        message: 'Multiple pins scheduled for the same time slot.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionUrl: '/schedule',
        actionText: 'Review Schedule',
      },
      {
        id: '3',
        type: 'error',
        title: 'Failed to Publish Pin',
        message: 'Unable to publish pin due to network error.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/queue',
        actionText: 'Retry',
      },
      // Add more mock notifications as needed
    ]

    setNotifications(mockNotifications)
    setUnreadCount(
      mockNotifications.filter((notification) => !notification.read).length
    )
  }, [])

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
        )
      case 'error':
        return (
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
        )
      case 'warning':
        return (
          <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />
        )
      case 'info':
        return (
          <InformationCircleIcon className="h-6 w-6 text-blue-500" />
        )
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
    onMarkAllRead?.()
  }

  const handleClear = () => {
    setNotifications([])
    setUnreadCount(0)
    onClear?.()
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-xs text-white font-medium flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Mark all as read
                    </button>
                    <button
                      onClick={handleClear}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <button
                            onClick={() =>
                              handleMarkAsRead(notification.id)
                            }
                            className="ml-2"
                          >
                            <XMarkIcon className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.actionUrl && (
                            <button
                              onClick={() =>
                                onActionClick?.(notification)
                              }
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {notification.actionText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
