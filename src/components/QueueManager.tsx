import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import {
  removePin,
  updatePinSchedule,
  retryFailedPin,
} from '../store/slices/schedulerSlice'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import {
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

type PinStatus = 'scheduled' | 'published' | 'failed' | 'processing'

interface QueuedPin {
  id: string
  title: string
  boardIds: string[]
  scheduledTime: string
  status: PinStatus
  error?: string
  imageUrl: string
}

export default function QueueManager() {
  const dispatch = useDispatch()
  const { scheduledPins } = useSelector((state: RootState) => state.scheduler)
  const { boards } = useSelector((state: RootState) => state.boards)
  const [selectedStatus, setSelectedStatus] = useState<PinStatus | 'all'>('all')

  const filteredPins = scheduledPins.filter(
    (pin) => selectedStatus === 'all' || pin.status === selectedStatus
  )

  const handleRemovePin = (pinId: string) => {
    try {
      dispatch(removePin(pinId))
      toast.success('Pin removed from queue')
    } catch (error) {
      toast.error('Failed to remove pin')
    }
  }

  const handleRetryPin = async (pinId: string) => {
    try {
      await dispatch(retryFailedPin(pinId))
      toast.success('Retrying pin publication')
    } catch (error) {
      toast.error('Failed to retry pin')
    }
  }

  const handleUpdateSchedule = async (pinId: string, newTime: string) => {
    try {
      await dispatch(updatePinSchedule({ pinId, scheduledTime: newTime }))
      toast.success('Schedule updated')
    } catch (error) {
      toast.error('Failed to update schedule')
    }
  }

  const getBoardNames = (boardIds: string[]) => {
    return boardIds
      .map((id) => boards.find((b) => b.id === id)?.name || 'Unknown')
      .join(', ')
  }

  const getStatusBadgeColor = (status: PinStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: PinStatus) => {
    switch (status) {
      case 'scheduled':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'published':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex space-x-2">
        {(['all', 'scheduled', 'published', 'failed', 'processing'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedStatus === status
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Queue List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {filteredPins.map((pin) => (
            <li key={pin.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Pin Image */}
                  <div className="flex-shrink-0 h-16 w-16">
                    <img
                      src={pin.imageUrl}
                      alt={pin.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  </div>

                  {/* Pin Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pin.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {getBoardNames(pin.boardIds)}
                    </p>
                    <div className="flex items-center mt-1">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-sm text-gray-500">
                        {format(new Date(pin.scheduledTime), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      pin.status
                    )}`}
                  >
                    {getStatusIcon(pin.status)}
                    <span className="ml-1">
                      {pin.status.charAt(0).toUpperCase() + pin.status.slice(1)}
                    </span>
                  </span>

                  <div className="flex items-center space-x-2">
                    {pin.status === 'failed' && (
                      <button
                        onClick={() => handleRetryPin(pin.id)}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                    )}
                    {pin.status === 'scheduled' && (
                      <input
                        type="datetime-local"
                        defaultValue={format(
                          new Date(pin.scheduledTime),
                          "yyyy-MM-dd'T'HH:mm"
                        )}
                        onChange={(e) =>
                          handleUpdateSchedule(pin.id, e.target.value)
                        }
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                    <button
                      onClick={() => handleRemovePin(pin.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {pin.status === 'failed' && pin.error && (
                <div className="mt-2 text-sm text-red-600">{pin.error}</div>
              )}
            </li>
          ))}
        </ul>

        {/* Empty State */}
        {filteredPins.length === 0 && (
          <div className="p-8 text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No pins in queue
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'all'
                ? 'Get started by adding some pins to your schedule.'
                : `No ${selectedStatus} pins found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
