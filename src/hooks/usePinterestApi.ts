import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { ApiService } from '../services/api'
import { PinData, Board, PinAnalytics } from '../types'

const usePinterestApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const dispatch = useDispatch()

  const handleRequest = async <T>(
    request: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await request()
      return result
    } catch (err) {
      setError(err as Error)
      console.error(errorMessage, err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createPin = useCallback(
    async (data: PinData) =>
      handleRequest(
        () => ApiService.createPin(data),
        'Failed to create pin'
      ),
    []
  )

  const schedulePin = useCallback(
    async (pinId: string, boardId: string, scheduledTime: Date) =>
      handleRequest(
        () => ApiService.schedulePin(pinId, boardId, scheduledTime),
        'Failed to schedule pin'
      ),
    []
  )

  const getBoards = useCallback(
    async () =>
      handleRequest(
        () => ApiService.getBoards(),
        'Failed to fetch boards'
      ),
    []
  )

  const getPinAnalytics = useCallback(
    async (pinId: string) =>
      handleRequest(
        () => ApiService.getPinAnalytics(pinId),
        'Failed to fetch pin analytics'
      ),
    []
  )

  const getBoardAnalytics = useCallback(
    async (boardId: string) =>
      handleRequest(
        () => ApiService.getBoardAnalytics(boardId),
        'Failed to fetch board analytics'
      ),
    []
  )

  const getOptimalPostingTimes = useCallback(
    async (boardId: string) =>
      handleRequest(
        () => ApiService.getOptimalPostingTimes(boardId),
        'Failed to fetch optimal posting times'
      ),
    []
  )

  return {
    loading,
    error,
    createPin,
    schedulePin,
    getBoards,
    getPinAnalytics,
    getBoardAnalytics,
    getOptimalPostingTimes,
  }
}

export default usePinterestApi
