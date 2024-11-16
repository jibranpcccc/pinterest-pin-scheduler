import React from 'react'
import { Card, Image, Typography, Tooltip } from 'antd'
import { PinData } from '../../types'

const { Text } = Typography

interface ImagePreviewProps {
  pin: PinData
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ pin }) => {
  return (
    <Card
      hoverable
      className="overflow-hidden"
      cover={
        <div className="aspect-w-1 aspect-h-1">
          <Image
            alt={pin.altText || pin.title}
            src={pin.imageUrl}
            className="object-cover"
            fallback="/placeholder-image.png"
            preview={false}
          />
        </div>
      }
    >
      <div className="space-y-2">
        <Tooltip title={pin.title}>
          <Text strong className="block truncate">
            {pin.title}
          </Text>
        </Tooltip>
        {pin.description && (
          <Tooltip title={pin.description}>
            <Text className="block text-sm text-gray-500 truncate">
              {pin.description}
            </Text>
          </Tooltip>
        )}
        {pin.scheduledTime && (
          <Text className="block text-xs text-gray-400">
            Scheduled: {new Date(pin.scheduledTime).toLocaleString()}
          </Text>
        )}
      </div>
    </Card>
  )
}
