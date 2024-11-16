import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AnalyticsDashboard } from '../Dashboard'
import { usePinterestApi } from '../../../hooks/usePinterestApi'

jest.mock('../../../hooks/usePinterestApi')

const mockAnalytics = {
  summary: {
    impressions: 1000,
    saves: 50,
    clicks: 100,
    engagement: 15,
  },
  trends: [
    {
      date: '2024-01-01',
      impressions: 100,
      saves: 5,
      clicks: 10,
      engagement: 15,
    },
    {
      date: '2024-01-02',
      impressions: 200,
      saves: 10,
      clicks: 20,
      engagement: 15,
    },
  ],
  topPins: [
    {
      id: '1',
      title: 'Top Pin 1',
      imageUrl: 'https://example.com/image1.jpg',
      impressions: 500,
      saves: 25,
      clicks: 50,
      engagement: 15,
    },
  ],
}

const mockBoards = [
  { id: '1', name: 'Board 1' },
  { id: '2', name: 'Board 2' },
]

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      boards: mockBoards,
      boardsLoading: false,
      getBoardAnalytics: jest.fn().mockResolvedValue(mockAnalytics),
      getPinAnalytics: jest.fn(),
      loading: false,
      error: null,
    })
  })

  it('renders dashboard components', async () => {
    render(<AnalyticsDashboard />)

    // Check if filters are rendered
    expect(screen.getByText('All Boards')).toBeInTheDocument()
    expect(screen.getByText('Board 1')).toBeInTheDocument()
    expect(screen.getByText('Board 2')).toBeInTheDocument()

    // Wait for analytics to load
    await waitFor(() => {
      // Check summary statistics
      expect(screen.getByText('1,000')).toBeInTheDocument() // Impressions
      expect(screen.getByText('50')).toBeInTheDocument() // Saves
      expect(screen.getByText('100')).toBeInTheDocument() // Clicks
      expect(screen.getByText('15%')).toBeInTheDocument() // Engagement
    })
  })

  it('handles board selection', async () => {
    const mockGetBoardAnalytics = jest.fn().mockResolvedValue(mockAnalytics)
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      boards: mockBoards,
      boardsLoading: false,
      getBoardAnalytics: mockGetBoardAnalytics,
      getPinAnalytics: jest.fn(),
      loading: false,
      error: null,
    })

    render(<AnalyticsDashboard />)

    // Select a board
    const boardSelect = screen.getByRole('combobox')
    fireEvent.change(boardSelect, { target: { value: '1' } })

    await waitFor(() => {
      expect(mockGetBoardAnalytics).toHaveBeenCalledWith('1', expect.any(Object))
    })
  })

  it('handles date range selection', async () => {
    const mockGetBoardAnalytics = jest.fn().mockResolvedValue(mockAnalytics)
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      boards: mockBoards,
      boardsLoading: false,
      getBoardAnalytics: mockGetBoardAnalytics,
      getPinAnalytics: jest.fn(),
      loading: false,
      error: null,
    })

    render(<AnalyticsDashboard />)

    // Select date range
    const dateRangePicker = screen.getByRole('textbox')
    fireEvent.change(dateRangePicker, {
      target: { value: ['2024-01-01', '2024-01-31'] },
    })

    await waitFor(() => {
      expect(mockGetBoardAnalytics).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          startDate: expect.any(String),
          endDate: expect.any(String),
        })
      )
    })
  })

  it('displays loading state', () => {
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      boards: [],
      boardsLoading: true,
      getBoardAnalytics: jest.fn(),
      getPinAnalytics: jest.fn(),
      loading: true,
      error: null,
    })

    render(<AnalyticsDashboard />)
    expect(screen.getAllByRole('alert')).toHaveLength(3) // Loading indicators
  })

  it('handles error state', () => {
    const error = new Error('Failed to load analytics')
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      boards: [],
      boardsLoading: false,
      getBoardAnalytics: jest.fn(),
      getPinAnalytics: jest.fn(),
      loading: false,
      error,
    })

    render(<AnalyticsDashboard />)
    expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument()
  })

  it('updates metrics selection', async () => {
    const mockGetBoardAnalytics = jest.fn().mockResolvedValue(mockAnalytics)
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      boards: mockBoards,
      boardsLoading: false,
      getBoardAnalytics: mockGetBoardAnalytics,
      getPinAnalytics: jest.fn(),
      loading: false,
      error: null,
    })

    render(<AnalyticsDashboard />)

    // Select metrics
    const metricsSelect = screen.getByRole('combobox', {
      name: /select metrics/i,
    })
    fireEvent.change(metricsSelect, {
      target: { value: ['impressions', 'engagement'] },
    })

    await waitFor(() => {
      expect(mockGetBoardAnalytics).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          metrics: ['impressions', 'engagement'],
        })
      )
    })
  })
})
