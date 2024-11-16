// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock FileReader
class MockFileReader {
  EMPTY = 0
  LOADING = 1
  DONE = 2
  readyState = this.EMPTY
  result: string | ArrayBuffer | null = null
  error: Error | null = null
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null

  readAsDataURL(blob: Blob) {
    this.readyState = this.LOADING
    setTimeout(() => {
      this.readyState = this.DONE
      this.result = 'data:image/jpeg;base64,mockBase64Data'
      if (this.onload) {
        this.onload.call(this, new ProgressEvent('load'))
      }
    }, 0)
  }
}

// @ts-ignore
global.FileReader = MockFileReader

// Mock URL
global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  drawImage: jest.fn(),
})

HTMLCanvasElement.prototype.toBlob = jest.fn().mockImplementation((callback) => {
  callback(new Blob(['mock-blob'], { type: 'image/jpeg' }))
})

// Mock Image
class MockImage {
  width = 1000
  height = 800
  src = ''
  onload: (() => void) | null = null
  onerror: ((error: Error) => void) | null = null

  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

// @ts-ignore
global.Image = MockImage

// Mock XLSX
global.XLSX = {
  write: jest.fn().mockReturnValue(new ArrayBuffer(0)),
  read: jest.fn().mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {
        A1: { v: 'title' },
        B1: { v: 'description' },
        C1: { v: 'imageUrl' },
      },
    },
  }),
}
