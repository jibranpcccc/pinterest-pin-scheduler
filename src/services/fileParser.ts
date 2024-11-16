import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { PinData } from '../types'

export class FileParserService {
  private static validateHeaders(headers: string[]): boolean {
    const requiredHeaders = ['title', 'imageUrl']
    const optionalHeaders = ['description', 'link', 'altText', 'tags']
    const validHeaders = [...requiredHeaders, ...optionalHeaders]

    // Check if all required headers are present
    const hasRequiredHeaders = requiredHeaders.every(header =>
      headers.includes(header)
    )

    // Check if all headers are valid
    const allHeadersValid = headers.every(header =>
      validHeaders.includes(header)
    )

    return hasRequiredHeaders && allHeadersValid
  }

  private static validateRow(row: Record<string, any>): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate required fields
    if (!row.title) {
      errors.push('Title is required')
    }
    if (!row.imageUrl) {
      errors.push('Image URL is required')
    } else if (!row.imageUrl.startsWith('http')) {
      errors.push('Invalid image URL format')
    }

    // Validate optional fields
    if (row.link && !row.link.startsWith('http')) {
      errors.push('Invalid link URL format')
    }

    if (row.tags && typeof row.tags === 'string') {
      // Convert comma-separated tags to array
      row.tags = row.tags.split(',').map((tag: string) => tag.trim())
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  public static async parseCSV(file: File): Promise<{
    pins: PinData[]
    errors: { row: number; errors: string[] }[]
  }> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || []
          if (!this.validateHeaders(headers)) {
            reject(new Error('Invalid CSV format: Missing required headers'))
            return
          }

          const pins: PinData[] = []
          const errors: { row: number; errors: string[] }[] = []

          results.data.forEach((row: any, index: number) => {
            const { isValid, errors: rowErrors } = this.validateRow(row)
            if (isValid) {
              pins.push(row as PinData)
            } else {
              errors.push({ row: index + 2, errors: rowErrors }) // +2 for header row and 0-based index
            }
          })

          resolve({ pins, errors })
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`))
        },
      })
    })
  }

  public static async parseExcel(file: File): Promise<{
    pins: PinData[]
    errors: { row: number; errors: string[] }[]
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          // Get the first sheet
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)

          const headers = Object.keys(jsonData[0] || {})
          if (!this.validateHeaders(headers)) {
            reject(new Error('Invalid Excel format: Missing required headers'))
            return
          }

          const pins: PinData[] = []
          const errors: { row: number; errors: string[] }[] = []

          jsonData.forEach((row: any, index: number) => {
            const { isValid, errors: rowErrors } = this.validateRow(row)
            if (isValid) {
              pins.push(row as PinData)
            } else {
              errors.push({ row: index + 2, errors: rowErrors })
            }
          })

          resolve({ pins, errors })
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  public static generateTemplate(format: 'csv' | 'xlsx'): Blob {
    const headers = [
      'title',
      'description',
      'imageUrl',
      'link',
      'altText',
      'tags',
    ]
    const data = [headers]

    if (format === 'csv') {
      const csv = Papa.unparse(data)
      return new Blob([csv], { type: 'text/csv' })
    } else {
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Pins')
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
    }
  }
}
