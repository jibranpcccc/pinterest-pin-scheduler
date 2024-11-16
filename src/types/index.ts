// Auth Types
export interface User {
  id: string
  name: string
  email: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

// Board Types
export interface Board {
  id: string
  name: string
  description?: string
  url: string
  privacy?: 'PUBLIC' | 'PROTECTED' | 'SECRET'
  pinCount?: number
  followerCount?: number
}

export interface BoardsState {
  boards: Board[]
  selectedBoards: string[]
  loading: boolean
  error: string | null
}

// Pin Types
export interface Pin {
  id: string
  title: string
  description: string
  link?: string
  imageUrl: string
  boardIds: string[]
  scheduledTime: string | null
  status: 'pending' | 'scheduled' | 'published' | 'failed'
}

export interface PinSchedule {
  imageUrl: string
  title: string
  description: string
  link: string
  boardIds: string[]
  scheduledTime: Date | null
}

export interface PinData {
  title: string
  description?: string
  link?: string
  imageUrl: string
  altText?: string
  tags?: string[]
  scheduledTime?: string
  boardId?: string
}

export interface SchedulerState {
  scheduledPins: Pin[]
  loading: boolean
  error: string | null
  selectedDate: string | null
  selectedPinId: string | null
}

// Settings Types
export interface TimeRange {
  start: string // HH:mm format
  end: string // HH:mm format
}

export interface ScheduleConfig {
  startTime: string
  endTime: string
  interval: number
  maxPinsPerDay: number
}

export interface SchedulingConstraints {
  maxPinsPerDay: number
  minIntervalMinutes: number
  preferredTimeRanges: TimeRange[]
  timezone: string
}

export interface SettingsState {
  defaultDescription: string
  defaultTags: string
  pinInterval: number
  maxPinsPerDay: number
  notifications: boolean
  minIntervalMinutes: number
  preferredTimeRanges: TimeRange[]
  timezone: string
}

// Analytics Types
export interface AnalyticsData {
  date: string
  value: number
}

export interface PinAnalytics {
  impressions: number
  saves: number
  clicks: number
  engagement: number
  period: 'day' | 'week' | 'month'
  date: string
}

export interface AnalyticsResponse {
  total: number
  change: number
  data: AnalyticsData[]
}

// API Types
export interface PinterestApiError {
  message: string
  code: string
}

export interface PinterestApiConfig {
  accessToken: string
}

export interface CreatePinData {
  title: string
  description?: string
  link?: string
  media_source: {
    source_type: 'image_url' | 'image_base64'
    url?: string
    content_type?: string
    data?: string
  }
}

export interface UpdatePinData {
  title?: string
  description?: string
  link?: string
}

export interface BatchOperationResult {
  success: boolean
  pinId?: string
  error?: string
  scheduledTime?: string
}

export interface BatchOperationResponse {
  results: BatchOperationResult[]
  summary: {
    total: number
    successful: number
    failed: number
    scheduledDates: string[]
  }
}
