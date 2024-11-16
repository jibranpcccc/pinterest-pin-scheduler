import React from 'react'
import { Card, Table, Image, Typography, Tag } from 'antd'
import { PinData } from '../../types'

const { Text } = Typography

interface TopPerformersProps {
  data: (PinData & {
    impressions: number
    saves: number
    clicks: number
    engagement: number
  })[]
  loading: boolean
  metrics: string[]
}

export const TopPerformers: React.FC<TopPerformersProps> = ({
  data,
  loading,
  metrics,
}) => {
  const columns = [
    {
      title: 'Pin',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl: string, record: PinData) => (
        <div className="flex items-center space-x-3">
          <Image
            src={imageUrl}
            alt={record.title}
            width={80}
            height={80}
            className="object-cover rounded"
            fallback="/placeholder-image.png"
          />
          <div>
            <Text strong className="block">
              {record.title}
            </Text>
            {record.description && (
              <Text className="text-sm text-gray-500 block">
                {record.description.slice(0, 50)}
                {record.description.length > 50 ? '...' : ''}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    ...metrics.map((metric) => ({
      title: metric.charAt(0).toUpperCase() + metric.slice(1),
      dataIndex: metric,
      key: metric,
      sorter: (a: any, b: any) => a[metric] - b[metric],
      render: (value: number) =>
        metric === 'engagement' ? (
          <Tag color="blue">{value.toFixed(2)}%</Tag>
        ) : (
          value.toLocaleString()
        ),
    })),
  ]

  return (
    <Card title="Top Performing Pins">
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
        }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  )
}
