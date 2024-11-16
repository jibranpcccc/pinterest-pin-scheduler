import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface PinPreviewProps {
  title: string
  description: string
  imageUrl: string
  onRemove?: () => void
  className?: string
}

export default function PinPreview({
  title,
  description,
  imageUrl,
  onRemove,
  className = '',
}: PinPreviewProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-md ${className}`}>
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <XMarkIcon className="h-4 w-4 text-gray-500" />
        </button>
      )}
      
      <div className="aspect-[2/3] relative">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 bg-white">
        <h3 className="font-medium text-gray-900 line-clamp-1">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}
