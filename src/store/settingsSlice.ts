import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TimeRange {
  start: string // HH:mm format
  end: string // HH:mm format
}

interface SettingsState {
  maxPinsPerDay: number
  minIntervalMinutes: number
  preferredTimeRanges: TimeRange[]
  timezone: string
  autoOptimize: boolean
  defaultDescription: string
  retryAttempts: number
  defaultBoard?: string
}

const initialState: SettingsState = {
  maxPinsPerDay: 25,
  minIntervalMinutes: 15,
  preferredTimeRanges: [{ start: '09:00', end: '21:00' }],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  autoOptimize: true,
  defaultDescription: '',
  retryAttempts: 3,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload }
    },
    addTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.preferredTimeRanges.push(action.payload)
    },
    removeTimeRange: (state, action: PayloadAction<number>) => {
      state.preferredTimeRanges.splice(action.payload, 1)
    },
    updateTimeRange: (
      state,
      action: PayloadAction<{ index: number; range: TimeRange }>
    ) => {
      state.preferredTimeRanges[action.payload.index] = action.payload.range
    },
    resetSettings: () => initialState,
  },
})

export const {
  updateSettings,
  addTimeRange,
  removeTimeRange,
  updateTimeRange,
  resetSettings,
} = settingsSlice.actions

export default settingsSlice.reducer
