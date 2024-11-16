import React, { useState, useEffect } from 'react'
import {
  Card,
  Tabs,
  Button,
  Input,
  Select,
  Space,
  DatePicker,
  message,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { PinList } from '../components/PinManagement/PinList'
import { BulkPinCreator } from '../components/BulkPinCreator'
import { usePinterestApi } from '../hooks/usePinterestApi'
import { PinData } from '../types'

const { TabPane } = Tabs
const { RangePicker } = DatePicker
const { Option } = Select

export const PinManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBoard, setSelectedBoard] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null)
  const [filteredPins, setFilteredPins] = useState<PinData[]>([])

  const {
    loading,
    error,
    getBoards,
    getPins,
    boards,
  } = usePinterestApi()

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const pins = await getPins({
          boardId: selectedBoard,
          status: selectedStatus,
          startDate: dateRange?.[0]?.toISOString(),
          endDate: dateRange?.[1]?.toISOString(),
        })

        // Apply search filter
        const filtered = pins.filter((pin) =>
          searchTerm
            ? pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              pin.description?.toLowerCase().includes(searchTerm.toLowerCase())
            : true
        )

        setFilteredPins(filtered)
      } catch (error) {
        message.error('Failed to fetch pins')
      }
    }

    fetchPins()
  }, [searchTerm, selectedBoard, selectedStatus, dateRange])

  const handleRefresh = () => {
    // Trigger a re-fetch of pins
    const fetchPins = async () => {
      try {
        const pins = await getPins({
          boardId: selectedBoard,
          status: selectedStatus,
          startDate: dateRange?.[0]?.toISOString(),
          endDate: dateRange?.[1]?.toISOString(),
        })
        setFilteredPins(pins)
        message.success('Pins refreshed successfully')
      } catch (error) {
        message.error('Failed to refresh pins')
      }
    }

    fetchPins()
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Pin List" key="list">
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search pins..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 200 }}
                />

                <Select
                  placeholder="Select Board"
                  value={selectedBoard}
                  onChange={setSelectedBoard}
                  style={{ width: 200 }}
                  allowClear
                >
                  {boards?.map((board) => (
                    <Option key={board.id} value={board.id}>
                      {board.name}
                    </Option>
                  ))}
                </Select>

                <Select
                  placeholder="Status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: 150 }}
                  allowClear
                >
                  <Option value="published">Published</Option>
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="draft">Draft</Option>
                  <Option value="failed">Failed</Option>
                </Select>

                <RangePicker
                  value={
                    dateRange
                      ? [moment(dateRange[0]), moment(dateRange[1])]
                      : null
                  }
                  onChange={(dates) => {
                    if (dates) {
                      setDateRange([dates[0].toDate(), dates[1].toDate()])
                    } else {
                      setDateRange(null)
                    }
                  }}
                />

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setActiveTab('create')}
                >
                  Create Pin
                </Button>
              </div>

              {/* Pin List */}
              <PinList
                pins={filteredPins}
                onPinUpdate={handleRefresh}
                loading={loading}
              />
            </div>
          </TabPane>

          <TabPane tab="Bulk Create" key="create">
            <BulkPinCreator
              onComplete={() => {
                setActiveTab('list')
                handleRefresh()
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}
