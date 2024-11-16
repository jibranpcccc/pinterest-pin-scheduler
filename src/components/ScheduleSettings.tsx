import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { updateSettings } from '../store/settingsSlice'
import { Switch } from '@headlessui/react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ScheduleSettings() {
  const dispatch = useDispatch()
  const settings = useSelector((state: RootState) => state.settings)

  const [newTimeRange, setNewTimeRange] = useState({
    start: '09:00',
    end: '21:00',
  })

  const handleTimeRangeAdd = () => {
    const updatedRanges = [
      ...(settings.preferredTimeRanges || []),
      newTimeRange,
    ]
    dispatch(
      updateSettings({
        ...settings,
        preferredTimeRanges: updatedRanges,
      })
    )
    setNewTimeRange({ start: '09:00', end: '21:00' })
  }

  const handleTimeRangeRemove = (index: number) => {
    const updatedRanges = (settings.preferredTimeRanges || []).filter(
      (_, i) => i !== index
    )
    dispatch(
      updateSettings({
        ...settings,
        preferredTimeRanges: updatedRanges,
      })
    )
  }

  const handleSettingChange = (
    key: string,
    value: number | boolean | string | Array<any>
  ) => {
    dispatch(
      updateSettings({
        ...settings,
        [key]: value,
      })
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Schedule Settings</h3>

      <div className="space-y-6">
        {/* Daily Pin Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Pins Per Day
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.maxPinsPerDay || 25}
            onChange={(e) =>
              handleSettingChange('maxPinsPerDay', parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Minimum Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Interval Between Pins (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="1440"
            value={settings.minIntervalMinutes || 15}
            onChange={(e) =>
              handleSettingChange('minIntervalMinutes', parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={
              settings.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone
            }
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {Intl.supportedValuesOf('timeZone').map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-optimization */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">
              Auto-optimize Schedule
            </div>
            <div className="text-sm text-gray-500">
              Automatically adjust pin timing for optimal engagement
            </div>
          </div>
          <Switch
            checked={settings.autoOptimize || false}
            onChange={(checked) => handleSettingChange('autoOptimize', checked)}
            className={`${
              settings.autoOptimize ? 'bg-primary-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span
              className={`${
                settings.autoOptimize ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        {/* Preferred Time Ranges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time Ranges
          </label>
          
          <div className="space-y-2 mb-4">
            {(settings.preferredTimeRanges || []).map((range, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
              >
                <input
                  type="time"
                  value={range.start}
                  onChange={(e) => {
                    const updatedRanges = [...(settings.preferredTimeRanges || [])]
                    updatedRanges[index] = {
                      ...range,
                      start: e.target.value,
                    }
                    handleSettingChange('preferredTimeRanges', updatedRanges)
                  }}
                  className="px-2 py-1 border border-gray-300 rounded"
                />
                <span>to</span>
                <input
                  type="time"
                  value={range.end}
                  onChange={(e) => {
                    const updatedRanges = [...(settings.preferredTimeRanges || [])]
                    updatedRanges[index] = {
                      ...range,
                      end: e.target.value,
                    }
                    handleSettingChange('preferredTimeRanges', updatedRanges)
                  }}
                  className="px-2 py-1 border border-gray-300 rounded"
                />
                <button
                  onClick={() => handleTimeRangeRemove(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={newTimeRange.start}
              onChange={(e) =>
                setNewTimeRange({ ...newTimeRange, start: e.target.value })
              }
              className="px-2 py-1 border border-gray-300 rounded"
            />
            <span>to</span>
            <input
              type="time"
              value={newTimeRange.end}
              onChange={(e) =>
                setNewTimeRange({ ...newTimeRange, end: e.target.value })
              }
              className="px-2 py-1 border border-gray-300 rounded"
            />
            <button
              onClick={handleTimeRangeAdd}
              className="p-1 text-primary-600 hover:bg-primary-50 rounded"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
