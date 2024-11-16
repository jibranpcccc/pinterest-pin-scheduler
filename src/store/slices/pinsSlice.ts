import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Pin {
  id: string
  title: string
  description: string
  imageUrl: string
  boardId: string
  hashtags: string[]
  scheduledTime: string | null
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  metrics?: {
    impressions: number
    saves: number
    clicks: number
  }
}

interface PinsState {
  items: Pin[]
  loading: boolean
  error: string | null
  selectedPin: string | null
  filters: {
    status: string
    board: string
    dateRange: [string | null, string | null]
  }
  sort: {
    field: string
    direction: 'asc' | 'desc'
  }
}

const initialState: PinsState = {
  items: [],
  loading: false,
  error: null,
  selectedPin: null,
  filters: {
    status: 'all',
    board: 'all',
    dateRange: [null, null],
  },
  sort: {
    field: 'scheduledTime',
    direction: 'asc',
  },
}

const pinsSlice = createSlice({
  name: 'pins',
  initialState,
  reducers: {
    // Pin CRUD operations
    addPin: (state, action: PayloadAction<Pin>) => {
      state.items.push(action.payload)
    },
    updatePin: (state, action: PayloadAction<Pin>) => {
      const index = state.items.findIndex(
        (pin) => pin.id === action.payload.id
      )
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deletePin: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (pin) => pin.id !== action.payload
      )
    },
    selectPin: (state, action: PayloadAction<string | null>) => {
      state.selectedPin = action.payload
    },

    // Batch operations
    addPins: (state, action: PayloadAction<Pin[]>) => {
      state.items.push(...action.payload)
    },
    deletePins: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter(
        (pin) => !action.payload.includes(pin.id)
      )
    },
    updatePinsStatus: (
      state,
      action: PayloadAction<{
        ids: string[]
        status: Pin['status']
      }>
    ) => {
      state.items = state.items.map((pin) =>
        action.payload.ids.includes(pin.id)
          ? { ...pin, status: action.payload.status }
          : pin
      )
    },

    // Filter and sort operations
    setFilters: (
      state,
      action: PayloadAction<Partial<PinsState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSort: (state, action: PayloadAction<PinsState['sort']>) => {
      state.sort = action.payload
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
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
  addPin,
  updatePin,
  deletePin,
  selectPin,
  addPins,
  deletePins,
  updatePinsStatus,
  setFilters,
  setSort,
  resetFilters,
  setLoading,
  setError,
} = pinsSlice.actions

export default pinsSlice.reducer

// Selectors
export const selectAllPins = (state: { pins: PinsState }) =>
  state.pins.items

export const selectPinById = (id: string) => (state: { pins: PinsState }) =>
  state.pins.items.find((pin) => pin.id === id)

export const selectFilteredPins = (state: { pins: PinsState }) => {
  const { items, filters, sort } = state.pins
  let filteredPins = [...items]

  // Apply status filter
  if (filters.status !== 'all') {
    filteredPins = filteredPins.filter(
      (pin) => pin.status === filters.status
    )
  }

  // Apply board filter
  if (filters.board !== 'all') {
    filteredPins = filteredPins.filter(
      (pin) => pin.boardId === filters.board
    )
  }

  // Apply date range filter
  if (filters.dateRange[0] && filters.dateRange[1]) {
    filteredPins = filteredPins.filter((pin) => {
      if (!pin.scheduledTime) return false
      const pinDate = new Date(pin.scheduledTime)
      const startDate = new Date(filters.dateRange[0]!)
      const endDate = new Date(filters.dateRange[1]!)
      return pinDate >= startDate && pinDate <= endDate
    })
  }

  // Apply sorting
  filteredPins.sort((a, b) => {
    const aValue = a[sort.field as keyof Pin]
    const bValue = b[sort.field as keyof Pin]
    if (aValue === null) return 1
    if (bValue === null) return -1
    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
    return 0
  })

  return filteredPins
}

export const selectPinMetrics = (state: { pins: PinsState }) => {
  const pins = state.pins.items
  return {
    total: pins.length,
    scheduled: pins.filter((pin) => pin.status === 'scheduled').length,
    published: pins.filter((pin) => pin.status === 'published').length,
    failed: pins.filter((pin) => pin.status === 'failed').length,
    totalImpressions: pins.reduce(
      (sum, pin) => sum + (pin.metrics?.impressions || 0),
      0
    ),
    totalSaves: pins.reduce(
      (sum, pin) => sum + (pin.metrics?.saves || 0),
      0
    ),
    totalClicks: pins.reduce(
      (sum, pin) => sum + (pin.metrics?.clicks || 0),
      0
    ),
  }
}

export const selectPinsByBoard = (boardId: string) => (state: {
  pins: PinsState
}) => state.pins.items.filter((pin) => pin.boardId === boardId)

export const selectPinsByDate = (date: string) => (state: {
  pins: PinsState
}) =>
  state.pins.items.filter(
    (pin) =>
      pin.scheduledTime &&
      new Date(pin.scheduledTime).toDateString() ===
        new Date(date).toDateString()
  )
