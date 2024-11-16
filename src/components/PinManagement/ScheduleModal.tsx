import React, { useState } from 'react'
import { Modal, Form, DatePicker, TimePicker, Radio, Alert } from 'antd'
import moment from 'moment'
import { PinData } from '../../types'
import { useScheduleOptimizer } from '../../hooks/useScheduleOptimizer'

interface ScheduleModalProps {
  pin: PinData
  visible: boolean
  onClose: () => void
  onSchedule: (scheduledTime: string) => Promise<void>
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  pin,
  visible,
  onClose,
  onSchedule,
}) => {
  const [form] = Form.useForm()
  const [scheduleType, setScheduleType] = useState<'manual' | 'optimal'>('manual')
  const { getOptimalTime, loading: optimizing } = useScheduleOptimizer()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      let scheduledTime: string

      if (scheduleType === 'manual') {
        const { date, time } = values
        scheduledTime = moment(date)
          .hours(time.hours())
          .minutes(time.minutes())
          .toISOString()
      } else {
        scheduledTime = await getOptimalTime(pin.boardId!)
      }

      await onSchedule(scheduledTime)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const disabledDate = (current: moment.Moment) => {
    // Can't select days before today
    return current && current < moment().startOf('day')
  }

  const disabledTime = (current: moment.Moment) => {
    if (!current) return {}
    const today = moment().startOf('day')
    const selected = current.startOf('day')

    if (selected.isSame(today)) {
      const currentHour = moment().hour()
      const currentMinute = moment().minute()

      return {
        disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),
        disabledMinutes: (hour: number) =>
          hour === currentHour
            ? Array.from({ length: currentMinute }, (_, i) => i)
            : [],
      }
    }

    return {}
  }

  return (
    <Modal
      title="Schedule Pin"
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Schedule"
      confirmLoading={optimizing}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="scheduleType" initialValue={scheduleType}>
          <Radio.Group
            onChange={(e) => setScheduleType(e.target.value)}
            value={scheduleType}
          >
            <Radio.Button value="manual">Manual Schedule</Radio.Button>
            <Radio.Button value="optimal">Optimal Time</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {scheduleType === 'manual' ? (
          <>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker
                disabledDate={disabledDate}
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: 'Please select a time' }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={15}
                disabledTime={disabledTime}
                className="w-full"
              />
            </Form.Item>
          </>
        ) : (
          <Alert
            message="Optimal Scheduling"
            description="We'll analyze your board's performance data and schedule this pin at the optimal time for maximum engagement."
            type="info"
            showIcon
          />
        )}
      </Form>
    </Modal>
  )
}
