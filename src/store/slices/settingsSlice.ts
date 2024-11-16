import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SettingsState } from '../../types'

const initialState: SettingsState = {
  defaultDescription: '',
  defaultTags: '',
  pinInterval: 60,
  maxPinsPerDay: 25,
  notifications: false,
  minIntervalMinutes: 15,
  preferredTimeRanges: [{ start: '09:00', end: '21:00' }],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload }
    },
    resetSettings: () => initialState,
  },
})

export const { updateSettings, resetSettings } = settingsSlice.actions
export default settingsSlice.reducer
