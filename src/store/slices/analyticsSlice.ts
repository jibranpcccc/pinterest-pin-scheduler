import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AnalyticsMetric {
  value: number
  change: number
  changeType: 'increase' | 'decrease'
}

interface BoardMetrics {
  id: string
  name: string
  metrics: {
    pins: number
    impressions: number
    saves: number
    clicks: number
    engagementRate: number
  }
}

interface TimeMetrics {
  hour: number
  impressions: number
  saves: number
  clicks: number
  engagementRate: number
}

interface AnalyticsState {
  overview: {
    totalViews: AnalyticsMetric
    engagementRate: AnalyticsMetric
    saves: AnalyticsMetric
    clicks: AnalyticsMetric
  }
  boardMetrics: BoardMetrics[]
  timeMetrics: TimeMetrics[]
  loading: boolean
  error: string | null
  timeRange: 'day' | 'week' | 'month' | 'year'
}

const initialState: AnalyticsState = {
  overview: {
    totalViews: { value: 0, change: 0, changeType: 'increase' },
    engagementRate: { value: 0, change: 0, changeType: 'increase' },
    saves: { value: 0, change: 0, changeType: 'increase' },
    clicks: { value: 0, change: 0, changeType: 'increase' },
  },
  boardMetrics: [],
  timeMetrics: [],
  loading: false,
  error: null,
  timeRange: 'week',
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Overview metrics
    setOverviewMetrics: (
      state,
      action: PayloadAction<AnalyticsState['overview']>
    ) => {
      state.overview = action.payload
    },

    // Board metrics
    setBoardMetrics: (
      state,
      action: PayloadAction<BoardMetrics[]>
    ) => {
      state.boardMetrics = action.payload
    },
    updateBoardMetrics: (state, action: PayloadAction<BoardMetrics>) => {
      const index = state.boardMetrics.findIndex(
        (board) => board.id === action.payload.id
      )
      if (index !== -1) {
        state.boardMetrics[index] = action.payload
      }
    },

    // Time metrics
    setTimeMetrics: (
      state,
      action: PayloadAction<TimeMetrics[]>
    ) => {
      state.timeMetrics = action.payload
    },

    // Time range
    setTimeRange: (
      state,
      action: PayloadAction<AnalyticsState['timeRange']>
    ) => {
      state.timeRange = action.payload
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setOverviewMetrics,
  setBoardMetrics,
  updateBoardMetrics,
  setTimeMetrics,
  setTimeRange,
  setLoading,
  setError,
} = analyticsSlice.actions

export default analyticsSlice.reducer

// Selectors
export const selectOverviewMetrics = (state: {
  analytics: AnalyticsState
}) => state.analytics.overview

export const selectBoardMetrics = (state: {
  analytics: AnalyticsState
}) => state.analytics.boardMetrics

export const selectTimeMetrics = (state: {
  analytics: AnalyticsState
}) => state.analytics.timeMetrics

export const selectTopPerformingBoards = (state: {
  analytics: AnalyticsState
}) =>
  [...state.analytics.boardMetrics]
    .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
    .slice(0, 5)

export const selectBestPostingTimes = (state: {
  analytics: AnalyticsState
}) =>
  [...state.analytics.timeMetrics]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 3)
    .map((metric) => ({
      hour: metric.hour,
      engagementRate: metric.engagementRate,
    }))

export const selectAnalyticsLoading = (state: {
  analytics: AnalyticsState
}) => state.analytics.loading

export const selectAnalyticsError = (state: {
  analytics: AnalyticsState
}) => state.analytics.error

export const selectTimeRange = (state: {
  analytics: AnalyticsState
}) => state.analytics.timeRange

export const selectEngagementTrend = (state: {
  analytics: AnalyticsState
}) => {
  const metrics = state.analytics.timeMetrics
  return {
    labels: metrics.map((m) => `${m.hour}:00`),
    data: metrics.map((m) => m.engagementRate),
  }
}

export const selectBoardPerformanceComparison = (state: {
  analytics: AnalyticsState
}) => {
  const boards = state.analytics.boardMetrics
  return {
    labels: boards.map((b) => b.name),
    impressions: boards.map((b) => b.metrics.impressions),
    saves: boards.map((b) => b.metrics.saves),
    clicks: boards.map((b) => b.metrics.clicks),
  }
}
