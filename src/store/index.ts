import { configureStore } from '@reduxjs/toolkit'
import pinsReducer from './slices/pinsSlice'
import analyticsReducer from './slices/analyticsSlice'
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
  reducer: {
    pins: pinsReducer,
    analytics: analyticsReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
