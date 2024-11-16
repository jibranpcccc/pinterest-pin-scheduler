import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface NotificationsState {
  items: Notification[]
  unreadCount: number
  filters: {
    type: string[]
    read: boolean | null
  }
  loading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  filters: {
    type: [],
    read: null,
  },
  loading: false,
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Notification operations
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload)
      if (!action.payload.read) {
        state.unreadCount++
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(
        (n) => n.id === action.payload
      )
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount--
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((notification) => {
        if (!notification.read) {
          notification.read = true
        }
      })
      state.unreadCount = 0
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(
        (n) => n.id === action.payload
      )
      if (notification && !notification.read) {
        state.unreadCount--
      }
      state.items = state.items.filter((n) => n.id !== action.payload)
    },
    clearAllNotifications: (state) => {
      state.items = []
      state.unreadCount = 0
    },

    // Filter operations
    setTypeFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.type = action.payload
    },
    setReadFilter: (state, action: PayloadAction<boolean | null>) => {
      state.filters.read = action.payload
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
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  setTypeFilter,
  setReadFilter,
  resetFilters,
  setLoading,
  setError,
} = notificationsSlice.actions

export default notificationsSlice.reducer

// Selectors
export const selectAllNotifications = (state: {
  notifications: NotificationsState
}) => state.notifications.items

export const selectUnreadCount = (state: {
  notifications: NotificationsState
}) => state.notifications.unreadCount

export const selectFilteredNotifications = (state: {
  notifications: NotificationsState
}) => {
  const { items, filters } = state.notifications
  let filteredItems = [...items]

  // Apply type filter
  if (filters.type.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      filters.type.includes(item.type)
    )
  }

  // Apply read filter
  if (filters.read !== null) {
    filteredItems = filteredItems.filter(
      (item) => item.read === filters.read
    )
  }

  return filteredItems
}

export const selectNotificationsByType = (type: Notification['type']) => (
  state: { notifications: NotificationsState }
) => state.notifications.items.filter((item) => item.type === type)

export const selectRecentNotifications = (state: {
  notifications: NotificationsState
}) => {
  const now = new Date()
  const twentyFourHoursAgo = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  )

  return state.notifications.items.filter((item) => {
    const itemDate = new Date(item.timestamp)
    return itemDate >= twentyFourHoursAgo
  })
}

export const selectNotificationsLoading = (state: {
  notifications: NotificationsState
}) => state.notifications.loading

export const selectNotificationsError = (state: {
  notifications: NotificationsState
}) => state.notifications.error
