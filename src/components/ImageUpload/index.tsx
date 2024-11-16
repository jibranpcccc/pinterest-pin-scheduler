import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'

interface ImageUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  value?: File[]
  preview?: boolean
}

export default function ImageUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif'],
  value = [],
  preview = true,
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>(value)
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check if adding new files would exceed maxFiles
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Filter out files that exceed maxSize
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`)
          return false
        }
        return true
      })

      // Create preview URLs
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])

      // Update files
      const newFiles = [...files, ...validFiles]
      setFiles(newFiles)
      onUpload(newFiles)
    },
    [files, maxFiles, maxSize, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: true,
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onUpload(newFiles)

    // Revoke preview URL and remove from previews
    if (previews[index]) {
      URL.revokeObjectURL(previews[index])
      setPreviews((prev) => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag & drop images here, or click to select
                <br />
                <span className="text-xs text-gray-500">
                  Maximum {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {preview && files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={previews[index]}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200">
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-xs text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => {
              setFiles([])
              setPreviews([])
              onUpload([])
            }}
            className="text-red-500 hover:text-red-600"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
