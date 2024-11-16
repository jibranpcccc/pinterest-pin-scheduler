import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
}

export default function ImageUpload({
  onUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles)
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles,
    maxSize,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : ''
        }`}
      >
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <input {...getInputProps()} />
            <p className="pl-1">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag and drop images here, or click to select files'}
            </p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to {maxSize / 1024 / 1024}MB</p>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="text-sm text-red-600">
              {errors.map((error) => (
                <p key={error.code}>{error.message}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
