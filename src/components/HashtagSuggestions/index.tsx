import React, { useState, useEffect } from 'react'
import { HashtagIcon, PlusIcon } from '@heroicons/react/24/outline'

interface Hashtag {
  id: string
  tag: string
  popularity: number
  category?: string
  relevanceScore?: number
}

interface HashtagSuggestionsProps {
  content: string
  onSelect: (hashtag: string) => void
  maxSuggestions?: number
  selectedTags?: string[]
  maxSelectedTags?: number
}

export default function HashtagSuggestions({
  content,
  onSelect,
  maxSuggestions = 10,
  selectedTags = [],
  maxSelectedTags = 30,
}: HashtagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Hashtag[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Mock data - replace with actual API call
  const fetchSuggestions = async (text: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock response
      const mockHashtags: Hashtag[] = [
        {
          id: '1',
          tag: 'design',
          popularity: 1000000,
          category: 'creative',
          relevanceScore: 0.95,
        },
        {
          id: '2',
          tag: 'inspiration',
          popularity: 800000,
          category: 'creative',
          relevanceScore: 0.9,
        },
        {
          id: '3',
          tag: 'photography',
          popularity: 1200000,
          category: 'art',
          relevanceScore: 0.85,
        },
        // Add more mock data as needed
      ]

      const uniqueCategories = Array.from(
        new Set(mockHashtags.map((tag) => tag.category).filter(Boolean))
      )
      setCategories(['all', ...uniqueCategories])

      setSuggestions(
        mockHashtags
          .filter(
            (tag) =>
              selectedCategory === 'all' || tag.category === selectedCategory
          )
          .slice(0, maxSuggestions)
      )
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (content) {
      fetchSuggestions(content)
    }
  }, [content, selectedCategory])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const handleSelect = (tag: string) => {
    if (selectedTags.length < maxSelectedTags) {
      onSelect(tag)
    }
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              <HashtagIcon className="h-4 w-4 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Tags Remaining Counter */}
      <div className="text-sm text-gray-500">
        {maxSelectedTags - selectedTags.length} tags remaining
      </div>

      {/* Suggestions Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {suggestions.map((hashtag) => (
            <button
              key={hashtag.id}
              onClick={() => handleSelect(hashtag.tag)}
              disabled={
                selectedTags.includes(hashtag.tag) ||
                selectedTags.length >= maxSelectedTags
              }
              className={`
                p-4 rounded-lg border text-left
                ${
                  selectedTags.includes(hashtag.tag)
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50 border-gray-200'
                }
                ${
                  selectedTags.length >= maxSelectedTags
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <HashtagIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {hashtag.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatNumber(hashtag.popularity)} posts
                  </p>
                </div>
                {!selectedTags.includes(hashtag.tag) && (
                  <PlusIcon className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {hashtag.relevanceScore && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${hashtag.relevanceScore * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {Math.round(hashtag.relevanceScore * 100)}% relevant
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && (
        <div className="text-center py-12">
          <HashtagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No suggestions found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your content or selected category
          </p>
        </div>
      )}
    </div>
  )
}
