import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import QueueManager from '../../components/QueueManager'
import BulkUploadProgress from '../../components/BulkUploadProgress'

const mockPins = [
  {
    id: '1',
    title: '10 Essential Design Tips',
    description: 'Learn the fundamentals of great design',
    imageUrl: 'https://via.placeholder.com/300x450',
    boardName: 'Design Inspiration',
    status: 'scheduled',
    scheduledTime: '2023-12-25T10:00:00Z',
    hashtags: ['design', 'tips', 'creativity'],
    metrics: {
      impressions: 1234,
      saves: 56,
      clicks: 89,
    },
  },
  // Add more mock pins
]

const filters = [
  { name: 'All', value: 'all' },
  { name: 'Scheduled', value: 'scheduled' },
  { name: 'Published', value: 'published' },
  { name: 'Failed', value: 'failed' },
  { name: 'Draft', value: 'draft' },
]

const sortOptions = [
  { name: 'Schedule Date', value: 'date' },
  { name: 'Board', value: 'board' },
  { name: 'Status', value: 'status' },
]

export default function Queue() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
  }

  const handleSort = (option: string) => {
    setSortBy(option)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pin Queue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor your scheduled pins
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Pin
        </Link>
      </div>

      {/* Upload Progress */}
      <BulkUploadProgress
        items={[
          {
            id: '1',
            title: 'Summer Design Trends',
            imageUrl: 'https://via.placeholder.com/300x450',
            status: 'uploading',
            progress: 45,
            boardName: 'Design Inspiration',
            scheduledTime: '2023-12-25 10:00 AM',
          },
          // Add more items
        ]}
        onCancel={(id) => console.log('Cancel', id)}
        onRetry={(id) => console.log('Retry', id)}
        onCancelAll={() => console.log('Cancel all')}
      />

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search pins..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by: {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedFilter === filter.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Queue Manager */}
        <QueueManager
          pins={mockPins.filter((pin) =>
            selectedFilter === 'all'
              ? true
              : pin.status === selectedFilter
          )}
          onDelete={(id) => console.log('Delete', id)}
          onEdit={(id) => console.log('Edit', id)}
          onReschedule={(id, date) =>
            console.log('Reschedule', id, date)
          }
          onRetry={(id) => console.log('Retry', id)}
        />
      </div>
    </div>
  )
}
