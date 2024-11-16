import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import {
  updatePinStatus,
  removePinFromQueue,
  retryPin,
} from '../store/slices/schedulerSlice'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'

type PinStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface QueueItem {
  id: string
  status: PinStatus
  scheduledTime: string
  error?: string
  retryCount: number
}

export default function QueueMonitor() {
  const dispatch = useDispatch()
  const pins = useSelector((state: RootState) => state.scheduler.scheduledPins)
  const settings = useSelector((state: RootState) => state.settings)

  const handleRetry = async (pinId: string) => {
    try {
      dispatch(retryPin(pinId))
      toast.success('Pin retry initiated')
    } catch (error) {
      toast.error('Failed to retry pin')
    }
  }

  const handleRemove = (pinId: string) => {
    dispatch(removePinFromQueue(pinId))
    toast.success('Pin removed from queue')
  }

  const getStatusIcon = (status: PinStatus) => {
    switch (status) {
      case 'completed':
        return (
          <CheckCircleIcon
            className="h-5 w-5 text-green-500"
            aria-hidden="true"
          />
        )
      case 'failed':
        return (
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        )
      case 'processing':
        return (
          <ArrowPathIcon
            className="h-5 w-5 text-blue-500 animate-spin"
            aria-hidden="true"
          />
        )
      default:
        return (
          <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        )
    }
  }

  const getStatusBadgeColor = (status: PinStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Queue Monitor</h3>
        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Scheduled Time
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Retries
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {pins.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-sm text-gray-500"
                        >
                          No pins in queue
                        </td>
                      </tr>
                    ) : (
                      pins.map((pin) => (
                        <tr key={pin.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              {getStatusIcon(pin.status)}
                              <span
                                className={`ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeColor(
                                  pin.status
                                )}`}
                              >
                                {pin.status}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {format(
                              parseISO(pin.scheduledTime),
                              'MMM d, yyyy HH:mm'
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {pin.retryCount} / {settings.retryAttempts}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end space-x-2">
                              {pin.status === 'failed' &&
                                pin.retryCount < settings.retryAttempts && (
                                  <button
                                    onClick={() => handleRetry(pin.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <ArrowPathIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                    <span className="sr-only">Retry</span>
                                  </button>
                                )}
                              <button
                                onClick={() => handleRemove(pin.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
