import React from 'react'
import { EyeIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

interface PinPreviewProps {
  title: string
  description?: string
  imageUrl: string
  boardName?: string
  metrics?: {
    views?: number
    likes?: number
    comments?: number
  }
  className?: string
  onClick?: () => void
}

export default function PinPreview({
  title,
  description,
  imageUrl,
  boardName,
  metrics,
  className = '',
  onClick,
}: PinPreviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <div
      className={`group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Container */}
      <div className="aspect-[2/3] bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
          {/* Metrics */}
          {metrics && (
            <div className="absolute top-2 right-2 flex items-center space-x-3">
              {typeof metrics.views === 'number' && (
                <div className="flex items-center text-white">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{formatNumber(metrics.views)}</span>
                </div>
              )}
              {typeof metrics.likes === 'number' && (
                <div className="flex items-center text-white">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{formatNumber(metrics.likes)}</span>
                </div>
              )}
              {typeof metrics.comments === 'number' && (
                <div className="flex items-center text-white">
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {formatNumber(metrics.comments)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <button className="absolute bottom-2 right-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}
        {boardName && (
          <p className="mt-2 text-xs text-gray-400 truncate">{boardName}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-2 left-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
        <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
