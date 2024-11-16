import { LoggerService } from './logger'

interface ImageDimensions {
  width: number
  height: number
}

interface ProcessedImage {
  url: string
  dimensions: ImageDimensions
  size: number
  format: string
}

export class ImageProcessor {
  private static instance: ImageProcessor

  private constructor() {}

  public static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor()
    }
    return ImageProcessor.instance
  }

  public async processImage(
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'jpeg' | 'png' | 'webp'
    } = {}
  ): Promise<ProcessedImage> {
    try {
      // Create canvas and load image
      const image = await this.loadImage(file)
      const { width, height } = this.calculateDimensions(
        { width: image.width, height: image.height },
        {
          maxWidth: options.maxWidth || 2048,
          maxHeight: options.maxHeight || 2048,
        }
      )

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      // Draw and process image
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      ctx.drawImage(image, 0, 0, width, height)

      // Convert to desired format
      const format = options.format || 'jpeg'
      const quality = options.quality || 0.9
      const blob = await this.canvasToBlob(canvas, format, quality)
      const url = URL.createObjectURL(blob)

      LoggerService.info(
        `Processed image: ${width}x${height}, ${(blob.size / 1024).toFixed(
          2
        )}KB, ${format}`
      )

      return {
        url,
        dimensions: { width, height },
        size: blob.size,
        format,
      }
    } catch (error) {
      LoggerService.error('Image processing failed:', error)
      throw error
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private calculateDimensions(
    original: ImageDimensions,
    max: ImageDimensions
  ): ImageDimensions {
    let { width, height } = original

    if (width > max.maxWidth!) {
      height = (height * max.maxWidth!) / width
      width = max.maxWidth!
    }

    if (height > max.maxHeight!) {
      width = (width * max.maxHeight!) / height
      height = max.maxHeight!
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        `image/${format}`,
        quality
      )
    })
  }

  public async optimizeForPinterest(
    file: File
  ): Promise<ProcessedImage> {
    // Pinterest recommended image dimensions and formats
    return this.processImage(file, {
      maxWidth: 1000,
      maxHeight: 1500,
      quality: 0.85,
      format: 'jpeg',
    })
  }

  public async generateThumbnail(
    file: File,
    size: number = 150
  ): Promise<ProcessedImage> {
    return this.processImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'webp',
    })
  }

  public async validateImage(file: File): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push('File is not an image')
    }

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      errors.push('Image size exceeds 20MB limit')
    }

    // Check dimensions
    try {
      const image = await this.loadImage(file)
      if (image.width < 100 || image.height < 100) {
        errors.push('Image dimensions are too small (minimum 100x100)')
      }
      if (image.width > 10000 || image.height > 10000) {
        errors.push('Image dimensions are too large (maximum 10000x10000)')
      }
    } catch (error) {
      errors.push('Failed to load image for validation')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  public async getImageMetadata(file: File): Promise<{
    dimensions: ImageDimensions
    size: number
    type: string
  }> {
    const image = await this.loadImage(file)
    return {
      dimensions: {
        width: image.width,
        height: image.height,
      },
      size: file.size,
      type: file.type,
    }
  }
}
