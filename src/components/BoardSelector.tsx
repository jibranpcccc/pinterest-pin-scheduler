import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  MagnifyingGlassIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface BoardSelectorProps {
  selectedBoards: string[]
  onChange: (boardIds: string[]) => void
  maxSelections?: number
}

export default function BoardSelector({
  selectedBoards,
  onChange,
  maxSelections = 5,
}: BoardSelectorProps) {
  const { boards, loading } = useSelector((state: RootState) => state.boards)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleBoard = (boardId: string) => {
    if (selectedBoards.includes(boardId)) {
      onChange(selectedBoards.filter((id) => id !== boardId))
    } else if (selectedBoards.length < maxSelections) {
      onChange([...selectedBoards, boardId])
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search boards..."
        />
      </div>

      {/* Selection Counter */}
      <div className="text-sm text-gray-500">
        {selectedBoards.length} of {maxSelections} boards selected
      </div>

      {/* Boards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-lg aspect-square"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredBoards.map((board) => (
            <button
              key={board.id}
              onClick={() => handleToggleBoard(board.id)}
              disabled={
                !selectedBoards.includes(board.id) &&
                selectedBoards.length >= maxSelections
              }
              className={`
                relative group aspect-square rounded-lg overflow-hidden
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${
                  selectedBoards.includes(board.id)
                    ? 'ring-2 ring-blue-500'
                    : 'hover:ring-2 hover:ring-gray-300'
                }
                ${
                  !selectedBoards.includes(board.id) &&
                  selectedBoards.length >= maxSelections
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }
              `}
            >
              {/* Board Image */}
              <img
                src={board.imageUrl}
                alt={board.name}
                className="w-full h-full object-cover"
              />

              {/* Selection Overlay */}
              <div
                className={`
                  absolute inset-0 flex items-center justify-center
                  ${
                    selectedBoards.includes(board.id)
                      ? 'bg-blue-500 bg-opacity-50'
                      : 'bg-black bg-opacity-0 group-hover:bg-opacity-25'
                  }
                  transition-all duration-200
                `}
              >
                {selectedBoards.includes(board.id) && (
                  <CheckIcon className="h-8 w-8 text-white" />
                )}
              </div>

              {/* Board Name */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                <p className="text-sm text-white truncate">{board.name}</p>
                <p className="text-xs text-gray-300 truncate">
                  {board.pinCount} pins
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBoards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No boards found</p>
        </div>
      )}
    </div>
  )
}
