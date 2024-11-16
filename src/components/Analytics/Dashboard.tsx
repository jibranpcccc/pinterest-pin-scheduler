import React, { useState, useEffect } from 'react'
import { Card, Select, DatePicker, Row, Col, Statistic, Spin } from 'antd'
import { Line, Bar } from '@ant-design/plots'
import { usePinterestApi } from '../../hooks/usePinterestApi'
import { ErrorBoundary } from '../ErrorBoundary'
import { PinAnalytics, Board } from '../../types'
import { AnalyticsSummary } from './Summary'
import { MetricsChart } from './MetricsChart'
import { TopPerformers } from './TopPerformers'

const { RangePicker } = DatePicker
const { Option } = Select

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    new Date(),
  ])
  const [selectedBoard, setSelectedBoard] = useState<string>('all')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'impressions',
    'saves',
    'clicks',
  ])

  const {
    boards,
    boardsLoading,
    getBoardAnalytics,
    getPinAnalytics,
    loading: analyticsLoading,
    error,
  } = usePinterestApi()

  const [analytics, setAnalytics] = useState<{
    summary: {
      impressions: number
      saves: number
      clicks: number
      engagement: number
    }
    trends: PinAnalytics[]
    topPins: any[]
  }>({
    summary: {
      impressions: 0,
      saves: 0,
      clicks: 0,
      engagement: 0,
    },
    trends: [],
    topPins: [],
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!dateRange[0] || !dateRange[1]) return

      try {
        let data
        if (selectedBoard === 'all') {
          // Fetch analytics for all boards
          const promises = boards.map((board) =>
            getBoardAnalytics(board.id, {
              startDate: dateRange[0].toISOString(),
              endDate: dateRange[1].toISOString(),
              metrics: selectedMetrics,
            })
          )
          const results = await Promise.all(promises)
          // Aggregate results
          data = aggregateAnalytics(results)
        } else {
          // Fetch analytics for specific board
          data = await getBoardAnalytics(selectedBoard, {
            startDate: dateRange[0].toISOString(),
            endDate: dateRange[1].toISOString(),
            metrics: selectedMetrics,
          })
        }

        setAnalytics(data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      }
    }

    fetchAnalytics()
  }, [dateRange, selectedBoard, selectedMetrics, boards])

  if (error) {
    return <div>Error loading analytics: {error.message}</div>
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex space-x-4">
            <Select
              style={{ width: 200 }}
              value={selectedBoard}
              onChange={setSelectedBoard}
              loading={boardsLoading}
            >
              <Option value="all">All Boards</Option>
              {boards?.map((board) => (
                <Option key={board.id} value={board.id}>
                  {board.name}
                </Option>
              ))}
            </Select>

            <RangePicker
              value={[
                dateRange[0] && moment(dateRange[0]),
                dateRange[1] && moment(dateRange[1]),
              ]}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0].toDate(), dates[1].toDate()])
                }
              }}
            />

            <Select
              mode="multiple"
              style={{ width: 300 }}
              value={selectedMetrics}
              onChange={setSelectedMetrics}
              placeholder="Select metrics"
            >
              <Option value="impressions">Impressions</Option>
              <Option value="saves">Saves</Option>
              <Option value="clicks">Clicks</Option>
              <Option value="engagement">Engagement Rate</Option>
            </Select>
          </div>
        </Card>

        {/* Summary Statistics */}
        <AnalyticsSummary
          data={analytics.summary}
          loading={analyticsLoading}
        />

        {/* Trends Chart */}
        <Card title="Performance Trends">
          <MetricsChart
            data={analytics.trends}
            metrics={selectedMetrics}
            loading={analyticsLoading}
          />
        </Card>

        {/* Top Performers */}
        <TopPerformers
          data={analytics.topPins}
          loading={analyticsLoading}
          metrics={selectedMetrics}
        />
      </div>
    </ErrorBoundary>
  )
}

// Helper function to aggregate analytics from multiple boards
function aggregateAnalytics(results: any[]) {
  const summary = {
    impressions: 0,
    saves: 0,
    clicks: 0,
    engagement: 0,
  }

  const trendsMap = new Map()
  const topPins: any[] = []

  results.forEach((result) => {
    // Aggregate summary
    summary.impressions += result.summary.impressions
    summary.saves += result.summary.saves
    summary.clicks += result.summary.clicks

    // Aggregate trends
    result.trends.forEach((trend: PinAnalytics) => {
      const existing = trendsMap.get(trend.date)
      if (existing) {
        existing.impressions += trend.impressions
        existing.saves += trend.saves
        existing.clicks += trend.clicks
      } else {
        trendsMap.set(trend.date, { ...trend })
      }
    })

    // Collect top pins
    topPins.push(...result.topPins)
  })

  // Calculate overall engagement rate
  summary.engagement =
    ((summary.saves + summary.clicks) / summary.impressions) * 100

  // Sort and limit top pins
  const sortedTopPins = topPins
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10)

  return {
    summary,
    trends: Array.from(trendsMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
    topPins: sortedTopPins,
  }
}
