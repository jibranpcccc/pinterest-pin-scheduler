import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PinToSchedule {
  id: string
  boardIds: string[]
  title: string
  description: string
  imageUrls: string[]
  estimatedEngagement?: number
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

interface SchedulerState {
  pendingPins: PinToSchedule[]
  schedule: { [pinId: string]: string } // pinId -> ISO date string
  selectedDate: string | null
  selectedPinId: string | null
  isOptimizing: boolean
  optimizationError: string | null
}

const initialState: SchedulerState = {
  pendingPins: [],
  schedule: {},
  selectedDate: null,
  selectedPinId: null,
  isOptimizing: false,
  optimizationError: null,
}

const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    addPinToQueue: (state, action: PayloadAction<PinToSchedule>) => {
      state.pendingPins.push(action.payload)
    },
    removePinFromQueue: (state, action: PayloadAction<string>) => {
      state.pendingPins = state.pendingPins.filter(
        (pin) => pin.id !== action.payload
      )
      delete state.schedule[action.payload]
    },
    updatePinStatus: (
      state,
      action: PayloadAction<{
        id: string
        status: 'pending' | 'processing' | 'completed' | 'failed'
        error?: string
      }>
    ) => {
      const pin = state.pendingPins.find((p) => p.id === action.payload.id)
      if (pin) {
        pin.status = action.payload.status
        pin.error = action.payload.error
      }
    },
    updateSchedule: (
      state,
      action: PayloadAction<{ [pinId: string]: string }>
    ) => {
      state.schedule = { ...state.schedule, ...action.payload }
    },
    clearSchedule: (state) => {
      state.schedule = {}
      state.pendingPins = []
      state.selectedPinId = null
      state.optimizationError = null
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload
    },
    setSelectedPin: (state, action: PayloadAction<string | null>) => {
      state.selectedPinId = action.payload
    },
    retryPin: (state, action: PayloadAction<string>) => {
      const pin = state.pendingPins.find((p) => p.id === action.payload)
      if (pin) {
        pin.status = 'pending'
        pin.error = undefined
      }
    },
    setOptimizationStatus: (
      state,
      action: PayloadAction<{ isOptimizing: boolean; error?: string | null }>
    ) => {
      state.isOptimizing = action.payload.isOptimizing
      state.optimizationError = action.payload.error || null
    },
    updatePinDetails: (
      state,
      action: PayloadAction<{
        id: string
        updates: Partial<PinToSchedule>
      }>
    ) => {
      const pin = state.pendingPins.find((p) => p.id === action.payload.id)
      if (pin) {
        Object.assign(pin, action.payload.updates)
      }
    },
    reorderQueue: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload
      const [movedPin] = state.pendingPins.splice(fromIndex, 1)
      state.pendingPins.splice(toIndex, 0, movedPin)
    },
  },
})

export const {
  addPinToQueue,
  removePinFromQueue,
  updatePinStatus,
  updateSchedule,
  clearSchedule,
  setSelectedDate,
  setSelectedPin,
  retryPin,
  setOptimizationStatus,
  updatePinDetails,
  reorderQueue,
} = schedulerSlice.actions

export default schedulerSlice.reducer
