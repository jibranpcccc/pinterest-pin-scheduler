import { FileParserService } from '../fileParser'

describe('FileParserService', () => {
  describe('parseCSV', () => {
    it('parses valid CSV data', async () => {
      const csvContent = `title,description,imageUrl,link,altText,tags
Test Pin,Test Description,https://example.com/image.jpg,https://example.com,Alt text,tag1,tag2`
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

      const result = await FileParserService.parseCSV(file)
      expect(result.pins).toHaveLength(1)
      expect(result.errors).toHaveLength(0)
      expect(result.pins[0]).toEqual({
        title: 'Test Pin',
        description: 'Test Description',
        imageUrl: 'https://example.com/image.jpg',
        link: 'https://example.com',
        altText: 'Alt text',
        tags: ['tag1', 'tag2'],
      })
    })

    it('validates required fields', async () => {
      const csvContent = `title,description,link
Test Pin,Test Description,https://example.com`
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

      const result = await FileParserService.parseCSV(file)
      expect(result.pins).toHaveLength(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].errors).toContain('Image URL is required')
    })

    it('validates URL formats', async () => {
      const csvContent = `title,description,imageUrl,link
Test Pin,Test Description,invalid-url,invalid-link`
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

      const result = await FileParserService.parseCSV(file)
      expect(result.pins).toHaveLength(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].errors).toContain('Invalid image URL format')
      expect(result.errors[0].errors).toContain('Invalid link URL format')
    })
  })

  describe('parseExcel', () => {
    it('parses valid Excel data', async () => {
      // Create mock Excel file
      const workbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {
            A1: { v: 'title' },
            B1: { v: 'description' },
            C1: { v: 'imageUrl' },
            A2: { v: 'Test Pin' },
            B2: { v: 'Test Description' },
            C2: { v: 'https://example.com/image.jpg' },
          },
        },
      }
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })
      const file = new File([excelBuffer], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const result = await FileParserService.parseExcel(file)
      expect(result.pins).toHaveLength(1)
      expect(result.errors).toHaveLength(0)
      expect(result.pins[0]).toMatchObject({
        title: 'Test Pin',
        description: 'Test Description',
        imageUrl: 'https://example.com/image.jpg',
      })
    })

    it('handles empty Excel file', async () => {
      const workbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {},
        },
      }
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })
      const file = new File([excelBuffer], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const result = await FileParserService.parseExcel(file)
      expect(result.pins).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('generateTemplate', () => {
    it('generates CSV template', () => {
      const blob = FileParserService.generateTemplate('csv')
      expect(blob instanceof Blob).toBe(true)
      expect(blob.type).toBe('text/csv')
    })

    it('generates Excel template', () => {
      const blob = FileParserService.generateTemplate('xlsx')
      expect(blob instanceof Blob).toBe(true)
      expect(blob.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    })

    it('includes all required headers', () => {
      const csvBlob = FileParserService.generateTemplate('csv')
      const reader = new FileReader()
      reader.readAsText(csvBlob)
      reader.onload = () => {
        const content = reader.result as string
        expect(content).toContain('title')
        expect(content).toContain('description')
        expect(content).toContain('imageUrl')
        expect(content).toContain('link')
        expect(content).toContain('altText')
        expect(content).toContain('tags')
      }
    })
  })
})
