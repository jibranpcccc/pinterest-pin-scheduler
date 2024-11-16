import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { optimizeSchedule } from '../../store/slices/schedulerSlice'
import { toast } from 'react-hot-toast'
import {
  ChartBarIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface OptimizationMetrics {
  engagementScore: number
  timeDistribution: number
  boardBalance: number
}

export default function ScheduleOptimizer() {
  const dispatch = useDispatch()
  const { scheduledPins, optimizationStatus } = useSelector(
    (state: RootState) => state.scheduler
  )
  const settings = useSelector((state: RootState) => state.settings)
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    engagementScore: 0,
    timeDistribution: 0,
    boardBalance: 0,
  })
  const [isOptimizing, setIsOptimizing] = useState(false)

  useEffect(() => {
    calculateMetrics()
  }, [scheduledPins])

  const calculateMetrics = () => {
    // Calculate engagement score based on scheduled times
    const engagementScore = calculateEngagementScore()
    
    // Calculate time distribution score
    const timeDistribution = calculateTimeDistribution()
    
    // Calculate board balance score
    const boardBalance = calculateBoardBalance()

    setMetrics({
      engagementScore,
      timeDistribution,
      boardBalance,
    })
  }

  const calculateEngagementScore = () => {
    // Mock engagement calculation
    // In production, this would use historical data and ML models
    return Math.min(
      (scheduledPins.filter(pin => 
        isPreferredTime(new Date(pin.scheduledTime))
      ).length / scheduledPins.length) * 100,
      100
    )
  }

  const calculateTimeDistribution = () => {
    if (scheduledPins.length === 0) return 100

    // Calculate time gaps between pins
    const sortedPins = [...scheduledPins].sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    )

    let totalGapVariance = 0
    for (let i = 1; i < sortedPins.length; i++) {
      const gap = new Date(sortedPins[i].scheduledTime).getTime() -
                  new Date(sortedPins[i-1].scheduledTime).getTime()
      const idealGap = settings.minIntervalMinutes * 60 * 1000
      totalGapVariance += Math.abs(gap - idealGap)
    }

    // Convert to a 0-100 score where lower variance is better
    return Math.max(100 - (totalGapVariance / (sortedPins.length * 1000000)), 0)
  }

  const calculateBoardBalance = () => {
    if (scheduledPins.length === 0) return 100

    // Count pins per board
    const boardCounts = scheduledPins.reduce((acc, pin) => {
      pin.boardIds.forEach(boardId => {
        acc[boardId] = (acc[boardId] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    // Calculate standard deviation
    const counts = Object.values(boardCounts)
    const mean = counts.reduce((a, b) => a + b) / counts.length
    const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length
    const stdDev = Math.sqrt(variance)

    // Convert to a 0-100 score where lower std dev is better
    return Math.max(100 - (stdDev * 10), 0)
  }

  const isPreferredTime = (date: Date) => {
    const hour = date.getHours()
    return settings.preferredTimeRanges.some(range => {
      const startHour = parseInt(range.start.split(':')[0])
      const endHour = parseInt(range.end.split(':')[0])
      return hour >= startHour && hour <= endHour
    })
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      await dispatch(optimizeSchedule())
      toast.success('Schedule optimized successfully')
    } catch (error) {
      toast.error('Failed to optimize schedule')
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Schedule Optimizer</h3>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || scheduledPins.length === 0}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${
              isOptimizing || scheduledPins.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {isOptimizing ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Optimizing...
            </>
          ) : (
            <>
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
              Optimize Schedule
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Engagement Score
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {Math.round(metrics.engagementScore)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Time Distribution
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {Math.round(metrics.timeDistribution)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Board Balance
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {Math.round(metrics.boardBalance)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {optimizationStatus && (
        <div className="mt-6 p-4 rounded-md bg-blue-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="h-5 w-5 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">{optimizationStatus}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
