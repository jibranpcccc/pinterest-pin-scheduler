import axios, { AxiosInstance } from 'axios'
import { config } from '../config'
import { LoggerService } from './logger'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

interface UserResponse {
  id: string
  username: string
  email: string
}

interface PinData {
  title: string
  description?: string
  link?: string
  imageUrl: string
  altText?: string
  boardId: string
  tags?: string[]
}

interface BoardData {
  name: string
  description?: string
  privacy?: 'PUBLIC' | 'PROTECTED' | 'SECRET'
}

export class PinterestService {
  private static instance: PinterestService
  private axiosInstance: AxiosInstance
  private logger: LoggerService

  private constructor() {
    this.logger = LoggerService.getInstance()
    this.axiosInstance = axios.create({
      baseURL: 'https://api.pinterest.com/v5',
      timeout: 10000,
    })

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const userId = config.headers['X-User-ID']
        this.logger.logPinterestAPICall(
          config.method?.toUpperCase() || 'UNKNOWN',
          config.url || 'UNKNOWN',
          userId?.toString() || 'UNKNOWN',
          { data: config.data }
        )
        return config
      },
      (error) => {
        this.logger.error('Pinterest API Request Error', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        const userId = error.config?.headers['X-User-ID']
        this.logger.logPinterestAPIError(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          error.config?.url || 'UNKNOWN',
          userId?.toString() || 'UNKNOWN',
          error,
          { response: error.response?.data }
        )
        return Promise.reject(error)
      }
    )
  }

  static getInstance(): PinterestService {
    if (!PinterestService.instance) {
      PinterestService.instance = new PinterestService()
    }
    return PinterestService.instance
  }

  private async request<T>(
    method: string,
    endpoint: string,
    accessToken: string,
    data?: any,
    userId?: string
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url: endpoint,
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-User-ID': userId,
        },
      })
      return response.data
    } catch (error: any) {
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data.message || 'Pinterest API error',
          details: error.response.data,
        }
      }
      throw {
        status: 500,
        message: 'Network error',
        details: error.message,
      }
    }
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const response = await this.request<TokenResponse>(
        'POST',
        '/oauth/token',
        '',
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.pinterest.redirectUri,
        },
        undefined
      )
      return response
    } catch (error: any) {
      console.error('Token exchange error:', error)
      throw {
        status: error.status || 500,
        message: 'Failed to exchange code for token',
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await this.request<TokenResponse>(
        'POST',
        '/oauth/token',
        '',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        undefined
      )
      return response
    } catch (error: any) {
      console.error('Token refresh error:', error)
      throw {
        status: error.status || 500,
        message: 'Failed to refresh token',
      }
    }
  }

  async getUserProfile(accessToken: string): Promise<UserResponse> {
    return this.request<UserResponse>('GET', '/user_account', accessToken)
  }

  async getBoards(accessToken: string) {
    return this.request<any>('GET', '/boards', accessToken)
  }

  async createBoard(accessToken: string, data: BoardData) {
    return this.request<any>('POST', '/boards', accessToken, data)
  }

  async deleteBoard(accessToken: string, boardId: string) {
    return this.request<void>('DELETE', `/boards/${boardId}`, accessToken)
  }

  async createPin(accessToken: string, boardId: string, data: PinData) {
    return this.request<any>('POST', `/boards/${boardId}/pins`, accessToken, data)
  }

  async updatePin(accessToken: string, pinId: string, data: Partial<PinData>) {
    return this.request<any>('PATCH', `/pins/${pinId}`, accessToken, data)
  }

  async deletePin(accessToken: string, pinId: string) {
    return this.request<void>('DELETE', `/pins/${pinId}`, accessToken)
  }

  async schedulePin(accessToken: string, pinId: string, scheduledTime: string) {
    return this.request<any>(
      'PUT',
      `/pins/${pinId}/schedule`,
      accessToken,
      { scheduled_time: scheduledTime }
    )
  }

  async getPinAnalytics(
    accessToken: string,
    pinId: string,
    startDate: string,
    endDate: string,
    metrics: string[]
  ) {
    return this.request<any>(
      'GET',
      `/pins/${pinId}/analytics`,
      accessToken,
      {
        start_date: startDate,
        end_date: endDate,
        metrics: metrics.join(','),
      }
    )
  }

  async getBoardAnalytics(
    accessToken: string,
    boardId: string,
    startDate: string,
    endDate: string,
    metrics: string[]
  ) {
    return this.request<any>(
      'GET',
      `/boards/${boardId}/analytics`,
      accessToken,
      {
        start_date: startDate,
        end_date: endDate,
        metrics: metrics.join(','),
      }
    )
  }
}
