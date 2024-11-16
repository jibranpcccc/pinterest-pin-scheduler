import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import ImageUpload from '../../components/ImageUpload'
import BoardSelector from '../../components/BoardSelector'
import HashtagSuggestions from '../../components/HashtagSuggestions'
import DateTimePicker from '../../components/DateTimePicker'
import PinOptimizer from '../../components/PinOptimizer'
import PinPreview from '../../components/PinPreview'

interface PinData {
  title: string
  description: string
  images: File[]
  boardId: string
  hashtags: string[]
  scheduledTime: Date | null
}

export default function CreatePin() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [pinData, setPinData] = useState<PinData>({
    title: '',
    description: '',
    images: [],
    boardId: '',
    hashtags: [],
    scheduledTime: null,
  })
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleImageUpload = (files: File[]) => {
    setPinData((prev) => ({ ...prev, images: files }))
    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const handleBoardSelect = (boardId: string) => {
    setPinData((prev) => ({ ...prev, boardId }))
  }

  const handleHashtagSelect = (hashtag: string) => {
    setPinData((prev) => ({
      ...prev,
      hashtags: [...prev.hashtags, hashtag],
    }))
  }

  const handleHashtagRemove = (hashtag: string) => {
    setPinData((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((tag) => tag !== hashtag),
    }))
  }

  const handleScheduleTime = (date: Date) => {
    setPinData((prev) => ({ ...prev, scheduledTime: date }))
  }

  const handleOptimize = (optimizations: any) => {
    setPinData((prev) => ({ ...prev, ...optimizations }))
  }

  const handleSubmit = async () => {
    // Implement pin creation and scheduling logic
    navigate('/queue')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Create New Pin
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Design and schedule your Pinterest content
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setStep(step > 1 ? step - 1 : step)}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!pinData.images.length}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
              Schedule Pin
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-between">
          {[
            'Upload Images',
            'Choose Board',
            'Add Details',
            'Schedule',
          ].map((stepName, index) => (
            <div
              key={stepName}
              className={`flex items-center ${
                index + 1 === step
                  ? 'text-blue-600'
                  : index + 1 < step
                  ? 'text-green-600'
                  : 'text-gray-500'
              }`}
            >
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  index + 1 === step
                    ? 'bg-blue-100'
                    : index + 1 < step
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}
              >
                {index + 1}
              </span>
              <span className="ml-2 text-sm font-medium">{stepName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-8">
        {step === 1 && (
          <div className="space-y-6">
            <ImageUpload onUpload={handleImageUpload} />
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {previewUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] rounded-lg overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => {
                          const newImages = [...pinData.images]
                          newImages.splice(index, 1)
                          setPinData((prev) => ({
                            ...prev,
                            images: newImages,
                          }))
                          const newUrls = [...previewUrls]
                          newUrls.splice(index, 1)
                          setPreviewUrls(newUrls)
                        }}
                        className="p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowUpTrayIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
                {previewUrls.length < 4 && (
                  <button
                    onClick={() =>
                      document.querySelector('input[type="file"]')?.click()
                    }
                    className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    <PlusIcon className="h-8 w-8 text-gray-400" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <BoardSelector
            selectedBoard={pinData.boardId}
            onSelect={handleBoardSelect}
          />
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={pinData.title}
                  onChange={(e) =>
                    setPinData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter a catchy title for your pin"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={pinData.description}
                  onChange={(e) =>
                    setPinData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe your pin and include relevant keywords"
                />
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Hashtags
              </h3>
              <HashtagSuggestions
                content={`${pinData.title} ${pinData.description}`}
                onSelect={handleHashtagSelect}
                selectedTags={pinData.hashtags}
              />
            </div>

            {/* Pin Preview */}
            {previewUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Preview
                </h3>
                <PinPreview
                  title={pinData.title}
                  description={pinData.description}
                  imageUrl={previewUrls[0]}
                />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            {/* Schedule */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Schedule Your Pin
              </h3>
              <DateTimePicker
                selectedDate={pinData.scheduledTime}
                onChange={handleScheduleTime}
              />
            </div>

            {/* Optimization */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Optimize Your Pin
              </h3>
              <PinOptimizer
                title={pinData.title}
                description={pinData.description}
                imageUrl={previewUrls[0]}
                hashtags={pinData.hashtags}
                boardId={pinData.boardId}
                scheduledTime={
                  pinData.scheduledTime || new Date()
                }
                onOptimize={handleOptimize}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
