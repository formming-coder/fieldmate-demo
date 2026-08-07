export type PhotoMetadata = {
  latitude: number
  longitude: number
  capturedAtIso: string
  device: string
  accuracyMeters?: number
  heading?: number
}

export type ProcessedPhotoAsset = {
  original: Blob
  compressed: Blob
  thumbnail: Blob
  metadata: PhotoMetadata
}

type ProcessOptions = {
  maxWidth?: number
  quality?: number
  thumbWidth?: number
}

function canvasFromImage(image: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('ไม่สามารถประมวลผลภาพได้')
  }
  context.drawImage(image, 0, 0, width, height)
  return canvas
}

function blobFromCanvas(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('ไม่สามารถแปลงภาพได้'))
        return
      }
      resolve(blob)
    }, 'image/jpeg', quality)
  })
}

function loadImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('ไม่สามารถโหลดภาพเพื่อลดขนาดได้'))
    }
    image.src = url
  })
}

function detectDevice() {
  if (typeof navigator === 'undefined') return 'unknown-device'
  return navigator.userAgent.slice(0, 120)
}

export async function processPhotoAsset(input: Blob, metadata: Omit<PhotoMetadata, 'capturedAtIso' | 'device'>, options: ProcessOptions = {}): Promise<ProcessedPhotoAsset> {
  const {
    maxWidth = 1920,
    quality = 0.78,
    thumbWidth = 480,
  } = options

  const image = await loadImage(input)
  const ratio = image.width > maxWidth ? maxWidth / image.width : 1
  const compressedWidth = Math.round(image.width * ratio)
  const compressedHeight = Math.round(image.height * ratio)

  const compressedCanvas = canvasFromImage(image, compressedWidth, compressedHeight)
  const compressed = await blobFromCanvas(compressedCanvas, quality)

  const thumbRatio = image.width > thumbWidth ? thumbWidth / image.width : 1
  const thumbCanvas = canvasFromImage(image, Math.round(image.width * thumbRatio), Math.round(image.height * thumbRatio))
  const thumbnail = await blobFromCanvas(thumbCanvas, 0.72)

  return {
    original: input,
    compressed,
    thumbnail,
    metadata: {
      ...metadata,
      capturedAtIso: new Date().toISOString(),
      device: detectDevice(),
    },
  }
}
