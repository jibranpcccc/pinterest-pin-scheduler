import React, { useState } from 'react'
import { Table, Image, Button, Space, Tag, Modal, message } from 'antd'
import { EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { PinData } from '../../types'
import { usePinterestApi } from '../../hooks/usePinterestApi'
import { PinEditModal } from './PinEditModal'
import { ScheduleModal } from './ScheduleModal'

interface PinListProps {
  pins: PinData[]
  onPinUpdate: () => void
  loading: boolean
}

export const PinList: React.FC<PinListProps> = ({ pins, onPinUpdate, loading }) => {
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null)
  const { deletePin, updatePin, schedulePin } = usePinterestApi()

  const handleDelete = async (pin: PinData) => {
    Modal.confirm({
      title: 'Delete Pin',
      content: 'Are you sure you want to delete this pin?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deletePin(pin.id!)
          message.success('Pin deleted successfully')
          onPinUpdate()
        } catch (error) {
          message.error('Failed to delete pin')
        }
      },
    })
  }

  const handleEdit = (pin: PinData) => {
    setSelectedPin(pin)
    setEditModalVisible(true)
  }

  const handleSchedule = (pin: PinData) => {
    setSelectedPin(pin)
    setScheduleModalVisible(true)
  }

  const columns = [
    {
      title: 'Pin',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 250,
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
            <div className="font-medium">{record.title}</div>
            {record.description && (
              <div className="text-sm text-gray-500">
                {record.description.slice(0, 50)}
                {record.description.length > 50 ? '...' : ''}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Board',
      dataIndex: 'boardName',
      key: 'boardName',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap = {
          published: 'green',
          scheduled: 'blue',
          draft: 'gold',
          failed: 'red',
        }
        return (
          <Tag color={statusMap[status as keyof typeof statusMap]}>
            {status.toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Schedule',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      width: 180,
      render: (scheduledTime: string) =>
        scheduledTime ? new Date(scheduledTime).toLocaleString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: PinData) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            icon={<ClockCircleOutlined />}
            onClick={() => handleSchedule(record)}
            size="small"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
            danger
          />
        </Space>
      ),
    },
  ]

  return (
    <>
      <Table
        dataSource={pins}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} pins`,
        }}
        scroll={{ x: 'max-content' }}
      />

      {selectedPin && (
        <>
          <PinEditModal
            pin={selectedPin}
            visible={editModalVisible}
            onClose={() => {
              setEditModalVisible(false)
              setSelectedPin(null)
            }}
            onSave={async (updatedPin) => {
              try {
                await updatePin(selectedPin.id!, updatedPin)
                message.success('Pin updated successfully')
                onPinUpdate()
                setEditModalVisible(false)
                setSelectedPin(null)
              } catch (error) {
                message.error('Failed to update pin')
              }
            }}
          />

          <ScheduleModal
            pin={selectedPin}
            visible={scheduleModalVisible}
            onClose={() => {
              setScheduleModalVisible(false)
              setSelectedPin(null)
            }}
            onSchedule={async (scheduledTime) => {
              try {
                await schedulePin(selectedPin.id!, scheduledTime)
                message.success('Pin scheduled successfully')
                onPinUpdate()
                setScheduleModalVisible(false)
                setSelectedPin(null)
              } catch (error) {
                message.error('Failed to schedule pin')
              }
            }}
          />
        </>
      )}
    </>
  )
}
