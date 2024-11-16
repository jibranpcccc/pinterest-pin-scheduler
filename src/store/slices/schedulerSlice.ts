import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Pin } from '../../types'

interface SchedulerState {
  scheduledPins: Pin[]
  loading: boolean
  error: string | null
  selectedDate: string | null
  selectedPinId: string | null
}

const initialState: SchedulerState = {
  scheduledPins: [],
  loading: false,
  error: null,
  selectedDate: null,
  selectedPinId: null,
}

const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string | null>) {
      state.selectedDate = action.payload
    },
    setSelectedPin(state, action: PayloadAction<string | null>) {
      state.selectedPinId = action.payload
    },
    addScheduledPin(state, action: PayloadAction<Pin>) {
      state.scheduledPins.push(action.payload)
    },
    removeScheduledPin(state, action: PayloadAction<string>) {
      state.scheduledPins = state.scheduledPins.filter(
        (pin) => pin.id !== action.payload
      )
    },
    updateScheduledPin(state, action: PayloadAction<Pin>) {
      const index = state.scheduledPins.findIndex(
        (pin) => pin.id === action.payload.id
      )
      if (index !== -1) {
        state.scheduledPins[index] = action.payload
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    clearScheduledPins(state) {
      state.scheduledPins = []
    },
  },
})

export const {
  setSelectedDate,
  setSelectedPin,
  addScheduledPin,
  removeScheduledPin,
  updateScheduledPin,
  setLoading,
  setError,
  clearScheduledPins,
} = schedulerSlice.actions

export default schedulerSlice.reducer
