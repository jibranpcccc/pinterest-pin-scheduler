import axios from 'axios'
import { RootState } from '../store'
import { setCredentials, logout } from '../store/slices/authSlice'
import { store } from '../store'
import { PinData, Board, PinAnalytics } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const state = store.getState() as RootState
    const token = state.auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout())
    }
    return Promise.reject(error)
  }
)

export const ApiService = {
  async createPin(data: PinData) {
    const response = await api.post('/pins', data)
    return response.data
  },

  async schedulePin(pinId: string, boardId: string, scheduledTime: Date) {
    const response = await api.post(`/pins/${pinId}/schedule`, {
      boardId,
      scheduledTime: scheduledTime.toISOString(),
    })
    return response.data
  },

  async getBoards(): Promise<Board[]> {
    const response = await api.get('/boards')
    return response.data
  },

  async getPinAnalytics(pinId: string): Promise<PinAnalytics> {
    const response = await api.get(`/pins/${pinId}/analytics`)
    return response.data
  },

  async getBoardAnalytics(boardId: string) {
    const response = await api.get(`/boards/${boardId}/analytics`)
    return response.data
  },

  async getOptimalPostingTimes(boardId: string) {
    const response = await api.get(`/boards/${boardId}/optimal-times`)
    return response.data
  },
}
