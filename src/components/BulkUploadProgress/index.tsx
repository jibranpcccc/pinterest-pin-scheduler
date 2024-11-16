import React from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface UploadItem {
  id: string
  title: string
  imageUrl: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  boardName?: string
  scheduledTime?: string
}

interface BulkUploadProgressProps {
  items: UploadItem[]
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onCancelAll: () => void
}

export default function BulkUploadProgress({
  items,
  onCancel,
  onRetry,
  onCancelAll,
}: BulkUploadProgressProps) {
  const totalItems = items.length
  const completedItems = items.filter(
    (item) => item.status === 'success'
  ).length
  const failedItems = items.filter(
    (item) => item.status === 'error'
  ).length
  const inProgressItems = items.filter(
    (item) =>
      item.status === 'uploading' || item.status === 'pending'
  ).length

  const overallProgress =
    (items.reduce((acc, item) => acc + item.progress, 0) /
      (totalItems * 100)) *
    100

  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return (
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
        )
      case 'uploading':
        return (
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Bulk Upload Progress
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {completedItems} of {totalItems} items processed
            </p>
          </div>
          {inProgressItems > 0 && (
            <button
              onClick={onCancelAll}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
            >
              Cancel All
            </button>
          )}
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {inProgressItems}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">
              {completedItems}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">
              {failedItems}
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Individual Items */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li
              key={item.id}
              className={`p-4 ${
                item.status === 'uploading'
                  ? 'bg-blue-50'
                  : item.status === 'error'
                  ? 'bg-red-50'
                  : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Image Preview */}
                <div className="flex-shrink-0 h-12 w-12">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      {item.status === 'uploading' && (
                        <button
                          onClick={() => onCancel(item.id)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                      {item.status === 'error' && (
                        <button
                          onClick={() => onRetry(item.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(item.status === 'uploading' ||
                    item.status === 'pending') && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                    {item.boardName && (
                      <span>Board: {item.boardName}</span>
                    )}
                    {item.scheduledTime && (
                      <span>
                        Scheduled: {item.scheduledTime}
                      </span>
                    )}
                    {item.error && (
                      <span className="text-red-600">
                        Error: {item.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
