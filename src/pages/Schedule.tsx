import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import usePinterestApi from '../hooks/usePinterestApi'
import BulkScheduleForm from '../components/BulkScheduleForm'
import ScheduleOptimizer from '../components/ScheduleOptimizer'
import ScheduleCalendar from '../components/ScheduleCalendar'
import ScheduleAnalytics from '../components/ScheduleAnalytics'
import ScheduleTimeline from '../components/ScheduleTimeline'
import ScheduleSettings from '../components/ScheduleSettings'
import QueueMonitor from '../components/QueueMonitor'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { setSelectedDate, setSelectedPin } from '../store/slices/schedulerSlice'
import { Pin } from '../types'

export default function Schedule() {
  const dispatch = useDispatch()
  const { token } = useSelector((state: RootState) => state.auth)
  const selectedDate = useSelector((state: RootState) => state.scheduler.selectedDate)
  const selectedPinId = useSelector((state: RootState) => state.scheduler.selectedPinId)
  const pinterestApi = usePinterestApi()
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings'>('schedule')

  const handleDateSelect = (date: Date) => {
    dispatch(setSelectedDate(date.toISOString()))
  }

  const handlePinSelect = (pinId: string) => {
    dispatch(setSelectedPin(pinId))
  }

  const handleSchedule = async (
    pins: Array<{
      id: string
      title: string
      description: string
      imageUrl: string
      file: File
    }>,
    boardIds: string[],
    scheduleTime: Date
  ) => {
    try {
      // Create pins first
      const createdPins = await Promise.all(
        pins.map(async (pin) => {
          const result = await pinterestApi.createPin({
            title: pin.title,
            description: pin.description,
            imageUrl: pin.imageUrl,
            boardIds,
          })
          return result
        })
      )

      // Schedule the created pins
      await Promise.all(
        createdPins.map(async (pin, index) => {
          const scheduledTime = new Date(scheduleTime)
          scheduledTime.setMinutes(scheduledTime.getMinutes() + index * 30) // 30-minute intervals
          
          await Promise.all(
            boardIds.map(async (boardId) => {
              await pinterestApi.schedulePin(pin.id, boardId, scheduledTime)
            })
          )
        })
      )

      toast.success('Pins scheduled successfully!')
    } catch (error) {
      console.error('Failed to schedule pins:', error)
      toast.error('Failed to schedule pins. Please try again.')
    }
  }

  if (!token) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Please log in to access the scheduler
        </h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pin Scheduler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Schedule and manage your Pinterest pins efficiently
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'schedule'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'settings'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'schedule' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <BulkScheduleForm onSchedule={handleSchedule} />
            <ScheduleOptimizer />
          </div>
          <div className="space-y-6">
            <ScheduleCalendar
              selectedDate={selectedDate ? new Date(selectedDate) : null}
              onDateSelect={handleDateSelect}
            />
            <ScheduleAnalytics />
          </div>
          <div className="lg:col-span-2">
            <ScheduleTimeline />
          </div>
          <div className="lg:col-span-2">
            <QueueMonitor />
          </div>
        </div>
      ) : (
        <ScheduleSettings />
      )}
    </div>
  )
}
