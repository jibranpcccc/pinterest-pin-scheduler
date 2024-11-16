import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { addPins } from '../../store/slices/schedulerSlice'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { parse } from 'papaparse'
import * as XLSX from 'xlsx'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface PinData {
  title: string
  description: string
  link: string
  boardIds: string[]
  image?: File
}

export default function BulkPinCreator() {
  const dispatch = useDispatch()
  const [pins, setPins] = useState<PinData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { boards } = useSelector((state: RootState) => state.boards)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    onDrop: handleFileDrop,
  })

  async function handleFileDrop(acceptedFiles: File[]) {
    setIsProcessing(true)
    try {
      const file = acceptedFiles[0]
      const extension = file.name.split('.').pop()?.toLowerCase()

      let data: PinData[] = []

      if (extension === 'csv') {
        data = await parseCSV(file)
      } else if (extension === 'xlsx') {
        data = await parseXLSX(file)
      }

      validatePinData(data)
      setPins(data)
      toast.success(`Successfully loaded ${data.length} pins`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  async function parseCSV(file: File): Promise<PinData[]> {
    return new Promise((resolve, reject) => {
      parse(file, {
        header: true,
        complete: (results) => {
          const pins = results.data.map((row: any) => ({
            title: row.title || '',
            description: row.description || '',
            link: row.link || '',
            boardIds: (row.boards || '').split(',').map((id: string) => id.trim()),
          }))
          resolve(pins)
        },
        error: (error) => reject(error),
      })
    })
  }

  async function parseXLSX(file: File): Promise<PinData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)

          const pins = jsonData.map((row: any) => ({
            title: row.title || '',
            description: row.description || '',
            link: row.link || '',
            boardIds: (row.boards || '').split(',').map((id: string) => id.trim()),
          }))
          resolve(pins)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  function validatePinData(data: PinData[]) {
    if (data.length === 0) {
      throw new Error('No pins found in file')
    }

    const errors: string[] = []
    data.forEach((pin, index) => {
      if (!pin.title) errors.push(`Pin ${index + 1}: Missing title`)
      if (!pin.description) errors.push(`Pin ${index + 1}: Missing description`)
      if (!pin.link) errors.push(`Pin ${index + 1}: Missing link`)
      if (pin.boardIds.length === 0) errors.push(`Pin ${index + 1}: No boards specified`)
      
      // Validate board IDs
      pin.boardIds.forEach(boardId => {
        if (!boards.find(b => b.id === boardId)) {
          errors.push(`Pin ${index + 1}: Invalid board ID ${boardId}`)
        }
      })
    })

    if (errors.length > 0) {
      throw new Error(`Validation errors:\n${errors.join('\n')}`)
    }
  }

  async function handleSubmit() {
    try {
      await dispatch(addPins(pins))
      setPins([])
      toast.success('Pins added successfully')
    } catch (error) {
      toast.error('Failed to add pins')
    }
  }

  function handleRemovePin(index: number) {
    setPins(pins.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center
          ${isProcessing ? 'bg-gray-50' : 'hover:bg-gray-50'}
          ${pins.length > 0 ? 'border-green-300' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon
          className={`
            mx-auto h-12 w-12
            ${isProcessing ? 'text-gray-400' : 'text-gray-400'}
            ${pins.length > 0 ? 'text-green-500' : ''}
          `}
        />
        <p className="mt-2 text-sm text-gray-600">
          {isProcessing
            ? 'Processing file...'
            : 'Drop your CSV or XLSX file here, or click to select'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          File should contain columns: title, description, link, boards
        </p>
      </div>

      {pins.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {pins.length} Pins Loaded
            </h3>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add to Schedule
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {pins.map((pin, index) => (
                <li key={index}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {pin.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => handleRemovePin(index)}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <DocumentIcon
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          <p className="truncate">{pin.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
