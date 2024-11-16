import axios from 'axios'
import {
  PinterestApiError,
  PinterestApiConfig,
  AnalyticsResponse,
  CreatePinData,
  UpdatePinData,
  Board,
  Pin,
} from '../types'

const PINTEREST_API_URL = import.meta.env.VITE_PINTEREST_API_URL

class PinterestApi {
  private accessToken: string

  constructor(config: PinterestApiConfig) {
    this.accessToken = config.accessToken
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${PINTEREST_API_URL}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data,
      })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(
          (error.response.data as PinterestApiError).message ||
            'An error occurred with the Pinterest API'
        )
      }
      throw error
    }
  }

  // Board Operations
  async getBoards() {
    return this.request<{ items: Board[] }>('GET', '/boards')
  }

  async createBoard(name: string, description?: string) {
    return this.request<Board>('POST', '/boards', {
      name,
      description,
    })
  }

  async deleteBoard(boardId: string) {
    return this.request<void>('DELETE', `/boards/${boardId}`)
  }

  async updateBoard(boardId: string, updates: { name?: string; description?: string }) {
    return this.request<Board>('PUT', `/boards/${boardId}`, updates)
  }

  // Pin Operations
  async createPin(boardId: string, data: CreatePinData) {
    return this.request<Pin>('POST', '/pins', {
      board_id: boardId,
      ...data,
    })
  }

  async schedulePin(pinId: string, publishDate: string) {
    return this.request<Pin>('PUT', `/pins/${pinId}`, {
      publish_date: publishDate,
    })
  }

  async deletePin(pinId: string) {
    return this.request<void>('DELETE', `/pins/${pinId}`)
  }

  async updatePin(pinId: string, data: UpdatePinData) {
    return this.request<Pin>('PUT', `/pins/${pinId}`, data)
  }

  // Analytics Operations
  async getBoardAnalytics(
    boardId: string,
    metric: 'IMPRESSION' | 'SAVE' | 'CLICK',
    startDate: string,
    endDate: string,
    granularity: 'DAY' | 'WEEK' | 'MONTH' = 'DAY'
  ): Promise<AnalyticsResponse> {
    const response = await this.request<any>('GET', `/boards/${boardId}/analytics`, {
      metric_types: [metric],
      start_date: startDate,
      end_date: endDate,
      granularity,
    })

    // Calculate total and percentage change
    const values = response.data.map((d: any) => d.value)
    const total = values.reduce((a: number, b: number) => a + b, 0)
    const previousPeriodTotal = values
      .slice(0, Math.floor(values.length / 2))
      .reduce((a: number, b: number) => a + b, 0)
    const currentPeriodTotal = values
      .slice(Math.floor(values.length / 2))
      .reduce((a: number, b: number) => a + b, 0)
    const change =
      previousPeriodTotal === 0
        ? 100
        : Math.round(
            ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100
          )

    return {
      total,
      change,
      data: response.data.map((d: any) => ({
        date: d.date,
        value: d.value,
      })),
    }
  }

  async getPinAnalytics(
    pinId: string,
    metric: 'IMPRESSION' | 'SAVE' | 'CLICK',
    startDate: string,
    endDate: string,
    granularity: 'DAY' | 'WEEK' | 'MONTH' = 'DAY'
  ): Promise<AnalyticsResponse> {
    const response = await this.request<any>('GET', `/pins/${pinId}/analytics`, {
      metric_types: [metric],
      start_date: startDate,
      end_date: endDate,
      granularity,
    })

    return {
      total: response.total || 0,
      change: response.change || 0,
      data: response.data || [],
    }
  }

  // User Operations
  async getUserProfile() {
    return this.request<any>('GET', '/user')
  }
}

export default PinterestApi
