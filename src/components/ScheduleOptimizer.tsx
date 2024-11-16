import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import useScheduleOptimizer from '../hooks/useScheduleOptimizer'
import { updateSchedule } from '../store/schedulerSlice'

interface ScheduleOptimizerProps {
  onOptimizationComplete?: (success: boolean) => void
}

export default function ScheduleOptimizer({
  onOptimizationComplete,
}: ScheduleOptimizerProps) {
  const dispatch = useDispatch()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pendingPins = useSelector((state: RootState) => state.scheduler.pendingPins)
  const existingSchedule = useSelector(
    (state: RootState) => state.scheduler.schedule
  )

  const { optimizeSchedule } = useScheduleOptimizer()

  const handleOptimize = async () => {
    setIsOptimizing(true)
    setError(null)

    try {
      const startTime = new Date()
      startTime.setMinutes(startTime.getMinutes() + 5) // Start 5 minutes from now

      const result = await optimizeSchedule(
        pendingPins,
        startTime,
        new Map(Object.entries(existingSchedule))
      )

      if (result.isValid) {
        // Convert Map to object for Redux storage
        const scheduleObject: { [key: string]: string } = {}
        result.schedule.forEach((date, pinId) => {
          scheduleObject[pinId] = date.toISOString()
        })

        dispatch(updateSchedule(scheduleObject))
        onOptimizationComplete?.(true)
      } else {
        setError(
          'Schedule optimization found conflicts:\n' + result.violations.join('\n')
        )
        onOptimizationComplete?.(false)
      }
    } catch (err) {
      setError('Failed to optimize schedule: ' + (err as Error).message)
      onOptimizationComplete?.(false)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Schedule Optimizer</h3>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Pending pins: {pendingPins.length}
        </p>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || pendingPins.length === 0}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${
              isOptimizing || pendingPins.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <pre className="whitespace-pre-wrap text-sm">{error}</pre>
        </div>
      )}
    </div>
  )
}
