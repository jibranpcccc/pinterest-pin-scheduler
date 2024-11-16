import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface OptimizationScore {
  category: string
  score: number
  suggestions: string[]
  status: 'good' | 'warning' | 'error'
}

interface PinOptimizerProps {
  title: string
  description: string
  imageUrl: string
  hashtags: string[]
  boardId: string
  scheduledTime: Date
  onOptimize: (optimizations: {
    title?: string
    description?: string
    hashtags?: string[]
    scheduledTime?: Date
  }) => void
}

export default function PinOptimizer({
  title,
  description,
  imageUrl,
  hashtags,
  boardId,
  scheduledTime,
  onOptimize,
}: PinOptimizerProps) {
  const [scores, setScores] = useState<OptimizationScore[]>([])
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [overallScore, setOverallScore] = useState(0)

  // Mock optimization analysis - replace with actual API call
  const analyzePin = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock analysis results
      const mockScores: OptimizationScore[] = [
        {
          category: 'Title',
          score: 85,
          suggestions: [
            'Add more descriptive keywords',
            'Keep title length between 40-60 characters',
          ],
          status: 'good',
        },
        {
          category: 'Description',
          score: 65,
          suggestions: [
            'Include a clear call-to-action',
            'Add relevant keywords naturally',
            'Use line breaks for better readability',
          ],
          status: 'warning',
        },
        {
          category: 'Hashtags',
          score: 90,
          suggestions: ['Consider adding trending hashtags in your niche'],
          status: 'good',
        },
        {
          category: 'Timing',
          score: 70,
          suggestions: [
            'Consider posting during peak engagement hours',
            'Analyze your audience timezone distribution',
          ],
          status: 'warning',
        },
        {
          category: 'Image',
          score: 95,
          suggestions: ['Image quality and dimensions are optimal'],
          status: 'good',
        },
      ]

      setScores(mockScores)
      setOverallScore(
        Math.round(
          mockScores.reduce((acc, score) => acc + score.score, 0) /
            mockScores.length
        )
      )
    } catch (error) {
      console.error('Error analyzing pin:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    analyzePin()
  }, [title, description, imageUrl, hashtags, boardId, scheduledTime])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusIcon = (status: OptimizationScore['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    }
  }

  const handleOptimize = async () => {
    setOptimizing(true)
    try {
      // Simulate optimization process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock optimized values
      const optimizedValues = {
        title: 'Optimized: ' + title,
        description: description + '\n\nOptimized with trending keywords',
        hashtags: [...hashtags, 'trending', 'viral'],
        scheduledTime: new Date(scheduledTime.getTime() + 2 * 60 * 60 * 1000), // +2 hours
      }

      onOptimize(optimizedValues)
    } catch (error) {
      console.error('Error optimizing pin:', error)
    } finally {
      setOptimizing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Optimization Score
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Based on Pinterest best practices and trending patterns
            </p>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
            >
              {overallScore}%
            </div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                overallScore >= 80
                  ? 'bg-green-500'
                  : overallScore >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Detailed Analysis
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {scores.map((score) => (
            <div key={score.category} className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(score.status)}
                  <h4 className="ml-2 text-sm font-medium text-gray-900">
                    {score.category}
                  </h4>
                </div>
                <div className={`font-medium ${getScoreColor(score.score)}`}>
                  {score.score}%
                </div>
              </div>

              <ul className="mt-2 space-y-1">
                {score.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-500"
                  >
                    <LightBulbIcon className="h-4 w-4 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Optimize Button */}
      <div className="flex justify-end">
        <button
          onClick={handleOptimize}
          disabled={optimizing || loading}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent
            text-sm font-medium rounded-md shadow-sm text-white
            ${
              optimizing || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }
          `}
        >
          <ChartBarIcon className="h-4 w-4 mr-1.5" />
          {optimizing
            ? 'Optimizing...'
            : loading
            ? 'Analyzing...'
            : 'Auto-Optimize Pin'}
        </button>
      </div>
    </div>
  )
}
