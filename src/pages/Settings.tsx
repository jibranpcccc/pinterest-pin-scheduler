import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { updateSettings } from '../store/slices/settingsSlice'

export default function Settings() {
  const dispatch = useDispatch()
  const settings = useSelector((state: RootState) => state.settings)
  const [form, setForm] = useState({
    defaultDescription: settings.defaultDescription || '',
    defaultTags: settings.defaultTags || '',
    pinInterval: settings.pinInterval || 60,
    maxPinsPerDay: settings.maxPinsPerDay || 25,
    notifications: settings.notifications || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(updateSettings(form))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="defaultDescription" className="block text-sm font-medium text-gray-700">
              Default Pin Description
            </label>
            <textarea
              id="defaultDescription"
              rows={3}
              className="input-field mt-1"
              value={form.defaultDescription}
              onChange={(e) => setForm({ ...form, defaultDescription: e.target.value })}
              placeholder="Enter your default pin description template..."
            />
          </div>

          <div>
            <label htmlFor="defaultTags" className="block text-sm font-medium text-gray-700">
              Default Tags
            </label>
            <input
              type="text"
              id="defaultTags"
              className="input-field mt-1"
              value={form.defaultTags}
              onChange={(e) => setForm({ ...form, defaultTags: e.target.value })}
              placeholder="Enter comma-separated tags..."
            />
          </div>

          <div>
            <label htmlFor="pinInterval" className="block text-sm font-medium text-gray-700">
              Pin Interval (minutes)
            </label>
            <input
              type="number"
              id="pinInterval"
              min="15"
              max="1440"
              className="input-field mt-1"
              value={form.pinInterval}
              onChange={(e) => setForm({ ...form, pinInterval: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label htmlFor="maxPinsPerDay" className="block text-sm font-medium text-gray-700">
              Maximum Pins Per Day
            </label>
            <input
              type="number"
              id="maxPinsPerDay"
              min="1"
              max="100"
              className="input-field mt-1"
              value={form.maxPinsPerDay}
              onChange={(e) => setForm({ ...form, maxPinsPerDay: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={form.notifications}
              onChange={(e) => setForm({ ...form, notifications: e.target.checked })}
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
              Enable email notifications
            </label>
          </div>

          <div className="pt-5">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
