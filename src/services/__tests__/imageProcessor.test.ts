import { ImageProcessor } from '../imageProcessor'

describe('ImageProcessor', () => {
  let imageProcessor: ImageProcessor
  let mockFile: File
  let mockImage: HTMLImageElement
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    imageProcessor = ImageProcessor.getInstance()

    // Mock file
    mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })

    // Mock Image
    mockImage = {
      width: 1000,
      height: 800,
      onload: null,
      onerror: null,
    } as unknown as HTMLImageElement

    // Mock Canvas and Context
    mockContext = {
      drawImage: jest.fn(),
    } as unknown as CanvasRenderingContext2D

    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      toBlob: jest.fn(),
    } as unknown as HTMLCanvasElement

    // Mock DOM methods
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test')
    global.FileReader = jest.fn().mockImplementation(() => ({
      readAsDataURL: jest.fn(),
      onload: null,
      onerror: null,
    }))
    global.Image = jest.fn().mockImplementation(() => mockImage)
    document.createElement = jest.fn().mockReturnValue(mockCanvas)
  })

  it('creates a singleton instance', () => {
    const instance1 = ImageProcessor.getInstance()
    const instance2 = ImageProcessor.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('processes image with default options', async () => {
    const processedImage = await imageProcessor.processImage(mockFile)

    expect(processedImage).toEqual({
      url: 'blob:test',
      dimensions: expect.any(Object),
      size: expect.any(Number),
      format: expect.any(String),
    })
  })

  it('optimizes image for Pinterest', async () => {
    const processedImage = await imageProcessor.optimizeForPinterest(mockFile)

    expect(processedImage.dimensions.width).toBeLessThanOrEqual(1000)
    expect(processedImage.dimensions.height).toBeLessThanOrEqual(1500)
    expect(processedImage.format).toBe('jpeg')
  })

  it('generates thumbnail', async () => {
    const size = 150
    const processedImage = await imageProcessor.generateThumbnail(mockFile, size)

    expect(processedImage.dimensions.width).toBeLessThanOrEqual(size)
    expect(processedImage.dimensions.height).toBeLessThanOrEqual(size)
    expect(processedImage.format).toBe('webp')
  })

  it('validates image size and dimensions', async () => {
    // Test valid image
    const validResult = await imageProcessor.validateImage(mockFile)
    expect(validResult.valid).toBe(true)
    expect(validResult.errors).toHaveLength(0)

    // Test invalid size
    const largeFile = new File([''], 'large.jpg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(largeFile, 'size', { value: 25 * 1024 * 1024 })

    const sizeResult = await imageProcessor.validateImage(largeFile)
    expect(sizeResult.valid).toBe(false)
    expect(sizeResult.errors).toContain('Image size exceeds 20MB limit')

    // Test invalid dimensions
    mockImage.width = 50
    mockImage.height = 50

    const dimensionsResult = await imageProcessor.validateImage(mockFile)
    expect(dimensionsResult.valid).toBe(false)
    expect(dimensionsResult.errors).toContain(
      'Image dimensions are too small (minimum 100x100)'
    )
  })

  it('gets image metadata', async () => {
    const metadata = await imageProcessor.getImageMetadata(mockFile)

    expect(metadata).toEqual({
      dimensions: {
        width: mockImage.width,
        height: mockImage.height,
      },
      size: mockFile.size,
      type: mockFile.type,
    })
  })

  it('handles processing errors', async () => {
    // Mock canvas context failure
    mockCanvas.getContext = jest.fn().mockReturnValue(null)

    await expect(imageProcessor.processImage(mockFile)).rejects.toThrow(
      'Failed to get canvas context'
    )
  })

  it('maintains aspect ratio during resizing', async () => {
    mockImage.width = 2000
    mockImage.height = 1000

    const processedImage = await imageProcessor.processImage(mockFile, {
      maxWidth: 1000,
      maxHeight: 1000,
    })

    expect(processedImage.dimensions.width).toBe(1000)
    expect(processedImage.dimensions.height).toBe(500)
  })

  it('handles different image formats', async () => {
    const formats = ['jpeg', 'png', 'webp'] as const

    for (const format of formats) {
      const processedImage = await imageProcessor.processImage(mockFile, {
        format,
      })
      expect(processedImage.format).toBe(format)
    }
  })
})
