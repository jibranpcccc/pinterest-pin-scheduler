import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { PinData } from '../../types'
import { usePinterestApi } from '../../hooks/usePinterestApi'

const { TextArea } = Input
const { Option } = Select

interface PinEditModalProps {
  pin: PinData
  visible: boolean
  onClose: () => void
  onSave: (updatedPin: Partial<PinData>) => Promise<void>
}

export const PinEditModal: React.FC<PinEditModalProps> = ({
  pin,
  visible,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm()
  const { boards, loading: boardsLoading } = usePinterestApi()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await onSave(values)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <Modal
      title="Edit Pin"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Save"
      confirmLoading={boardsLoading}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: pin.title,
          description: pin.description,
          link: pin.link,
          boardId: pin.boardId,
          altText: pin.altText,
          tags: pin.tags?.join(', '),
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="link"
          label="Link"
          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="boardId" label="Board">
          <Select loading={boardsLoading}>
            {boards?.map((board) => (
              <Option key={board.id} value={board.id}>
                {board.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="altText" label="Alt Text">
          <Input />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Input placeholder="Comma-separated tags" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
