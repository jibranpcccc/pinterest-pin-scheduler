import React, { useState } from 'react'
import { Form, Upload, Button, Select, DatePicker, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { usePinterestApi } from '../../hooks/usePinterestApi'

interface BulkScheduleFormProps {
  onSchedule: (
    pins: Array<{
      id: string
      title: string
      description: string
      imageUrl: string
      file: File
    }>,
    boardIds: string[],
    scheduleTime: Date
  ) => void
}

export default function BulkScheduleForm({ onSchedule }: BulkScheduleFormProps) {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const { boards } = useSelector((state: RootState) => state.boards)

  const handleUpload = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)

      const pins = await Promise.all(
        fileList.map(async (file) => {
          const originalFile = file.originFileObj as File
          const imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(originalFile)
          })

          return {
            id: file.uid,
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            description: '',
            imageUrl,
            file: originalFile,
          }
        })
      )

      onSchedule(pins, values.boardIds, values.scheduleTime.toDate())
      form.resetFields()
      setFileList([])
      message.success('Files uploaded successfully')
    } catch (error) {
      message.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const uploadProps = {
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file: UploadFile) => {
      if (!file.type?.startsWith('image/')) {
        message.error(`${file.name} is not an image file`)
        return Upload.LIST_IGNORE
      }
      setFileList([...fileList, file])
      return false
    },
    fileList,
  }

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="files"
        label="Upload Images"
        rules={[{ required: true, message: 'Please upload at least one image' }]}
      >
        <Upload {...uploadProps} listType="picture" multiple>
          <Button icon={<UploadOutlined />}>Select Images</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="boardIds"
        label="Select Boards"
        rules={[{ required: true, message: 'Please select at least one board' }]}
      >
        <Select
          mode="multiple"
          placeholder="Select boards to pin to"
          style={{ width: '100%' }}
        >
          {boards.map((board) => (
            <Select.Option key={board.id} value={board.id}>
              {board.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="scheduleTime"
        label="Start Schedule From"
        rules={[{ required: true, message: 'Please select a start time' }]}
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          disabledDate={(current) => current && current < new Date()}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
          style={{ width: '100%' }}
        >
          {uploading ? 'Uploading' : 'Start Upload'}
        </Button>
      </Form.Item>
    </Form>
  )
}
