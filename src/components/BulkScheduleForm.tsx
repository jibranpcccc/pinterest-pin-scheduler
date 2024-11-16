import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import {
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface BulkScheduleFormProps {
  onSchedule: (
    files: File[],
    boardIds: string[],
    scheduleTime: Date
  ) => Promise<void>
}

export default function BulkScheduleForm({ onSchedule }: BulkScheduleFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [selectedBoards, setSelectedBoards] = useState<string[]>([])
  const [scheduleTime, setScheduleTime] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { boards } = useSelector((state: RootState) => state.boards)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for image files
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== acceptedFiles.length) {
      toast.error('Some files were rejected. Only images are allowed.')
    }
    setFiles(prev => [...prev, ...imageFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      toast.error('Please select at least one image')
      return
    }
    if (selectedBoards.length === 0) {
      toast.error('Please select at least one board')
      return
    }

    setIsSubmitting(true)
    try {
      await onSchedule(files, selectedBoards, scheduleTime)
      toast.success('Files uploaded successfully')
      setFiles([])
      setSelectedBoards([])
    } catch (error) {
      toast.error('Failed to schedule pins')
      console.error('Upload error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload Images
        </label>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          `}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          {isDragActive ? (
            <p className="mt-2 text-sm text-gray-600">Drop the files here...</p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Drag 'n' drop images here, or click to select files
            </p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected Files ({files.length})
          </label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group rounded-lg overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Boards
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {boards.map((board) => (
            <label
              key={board.id}
              className={`
                relative flex items-center p-4 rounded-lg border cursor-pointer
                ${
                  selectedBoards.includes(board.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }
              `}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedBoards.includes(board.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBoards([...selectedBoards, board.id])
                  } else {
                    setSelectedBoards(selectedBoards.filter(id => id !== board.id))
                  }
                }}
              />
              <span className="flex-1 text-sm">{board.name}</span>
              {selectedBoards.includes(board.id) && (
                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Schedule Start Time
        </label>
        <input
          type="datetime-local"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={format(scheduleTime, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => setScheduleTime(new Date(e.target.value))}
          min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || files.length === 0 || selectedBoards.length === 0}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${
              isSubmitting || files.length === 0 || selectedBoards.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }
          `}
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Pins'}
        </button>
      </div>
    </form>
  )
}
