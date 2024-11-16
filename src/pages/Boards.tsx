import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import usePinterestApi from '../hooks/usePinterestApi'
import {
  PlusIcon,
  TrashIcon,
  ChartBarIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

interface BoardAnalytics {
  impressions: number
  saves: number
  clicks: number
}

export default function Boards() {
  const { boards } = useSelector((state: RootState) => state.boards)
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const pinterestApi = usePinterestApi(accessToken)
  const [analytics, setAnalytics] = useState<Record<string, BoardAnalytics>>({})
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [editingBoard, setEditingBoard] = useState<string | null>(null)

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardName.trim()) return

    await pinterestApi.createBoard(newBoardName, newBoardDescription)
    setNewBoardName('')
    setNewBoardDescription('')
  }

  const handleDeleteBoard = async (boardId: string) => {
    await pinterestApi.deleteBoard(boardId)
  }

  const fetchBoardAnalytics = async (boardId: string) => {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const [impressions, saves, clicks] = await Promise.all([
      pinterestApi.getBoardAnalytics(boardId, 'IMPRESSION', startDate, endDate),
      pinterestApi.getBoardAnalytics(boardId, 'SAVE', startDate, endDate),
      pinterestApi.getBoardAnalytics(boardId, 'CLICK', startDate, endDate),
    ])

    setAnalytics((prev) => ({
      ...prev,
      [boardId]: {
        impressions: impressions?.total || 0,
        saves: saves?.total || 0,
        clicks: clicks?.total || 0,
      },
    }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your Pinterest boards and view their performance metrics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            onClick={() => setEditingBoard('new')}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Board
          </button>
        </div>
      </div>

      {editingBoard === 'new' && (
        <form onSubmit={handleCreateBoard} className="mt-8 space-y-4">
          <div>
            <label htmlFor="boardName" className="block text-sm font-medium text-gray-700">
              Board Name
            </label>
            <input
              type="text"
              id="boardName"
              className="mt-1 input-field"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="boardDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="boardDescription"
              rows={3}
              className="mt-1 input-field"
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditingBoard(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Board
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Analytics
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {boards.map((board) => (
                    <tr key={board.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {board.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {board.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {analytics[board.id] ? (
                          <div className="flex space-x-4">
                            <span>👁️ {analytics[board.id].impressions}</span>
                            <span>💾 {analytics[board.id].saves}</span>
                            <span>🔗 {analytics[board.id].clicks}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="text-primary-600 hover:text-primary-900"
                            onClick={() => fetchBoardAnalytics(board.id)}
                          >
                            <ChartBarIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            className="text-primary-600 hover:text-primary-900"
                            onClick={() => setEditingBoard(board.id)}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteBoard(board.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
