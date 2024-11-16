import React, { useState } from 'react'
import { HashtagIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TagGroup {
  id: string
  name: string
  tags: string[]
}

interface TagManagerProps {
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  selectedTags: string[]
  maxTags?: number
}

export default function TagManager({
  onTagSelect,
  onTagRemove,
  selectedTags,
  maxTags = 30,
}: TagManagerProps) {
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([
    {
      id: '1',
      name: 'Design',
      tags: [
        'design',
        'graphicdesign',
        'webdesign',
        'uidesign',
        'illustration',
      ],
    },
    {
      id: '2',
      name: 'Photography',
      tags: [
        'photography',
        'portrait',
        'landscape',
        'naturephotography',
        'travelphotography',
      ],
    },
    {
      id: '3',
      name: 'Art',
      tags: ['art', 'digitalart', 'painting', 'drawing', 'sketch'],
    },
  ])
  const [newTag, setNewTag] = useState('')
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const handleAddTag = () => {
    if (
      newTag &&
      !selectedTags.includes(newTag) &&
      selectedTags.length < maxTags
    ) {
      onTagSelect(newTag.toLowerCase().replace(/\s+/g, ''))
      setNewTag('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="space-y-6">
      {/* Selected Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Selected Tags ({selectedTags.length}/{maxTags})
        </label>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              <HashtagIcon className="h-4 w-4 mr-1" />
              {tag}
              <button
                onClick={() => onTagRemove(tag)}
                className="ml-1.5 hover:text-blue-900"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Add New Tag */}
      <div>
        <label
          htmlFor="new-tag"
          className="block text-sm font-medium text-gray-700"
        >
          Add New Tag
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
            #
          </span>
          <input
            type="text"
            id="new-tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter a new tag"
            maxLength={30}
          />
          <button
            onClick={handleAddTag}
            disabled={
              !newTag ||
              selectedTags.includes(newTag) ||
              selectedTags.length >= maxTags
            }
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add
          </button>
        </div>
      </div>

      {/* Tag Groups */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Popular Tags
        </label>
        <div className="space-y-4">
          {/* Group Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {tagGroups.map((group) => (
              <button
                key={group.id}
                onClick={() =>
                  setActiveGroup(
                    activeGroup === group.id ? null : group.id
                  )
                }
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeGroup === group.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Tag Suggestions */}
          {activeGroup && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {tagGroups
                .find((group) => group.id === activeGroup)
                ?.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagSelect(tag)}
                    disabled={
                      selectedTags.includes(tag) ||
                      selectedTags.length >= maxTags
                    }
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm
                      ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-50 text-blue-800 cursor-not-allowed'
                          : selectedTags.length >= maxTags
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <HashtagIcon className="h-4 w-4 mr-1.5" />
                    {tag}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Tag Guidelines */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <HashtagIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Tag Guidelines
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Use relevant tags that describe your pin</li>
                <li>Combine broad and specific tags</li>
                <li>Avoid using spaces in tags</li>
                <li>
                  Maximum {maxTags} tags allowed per pin
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
