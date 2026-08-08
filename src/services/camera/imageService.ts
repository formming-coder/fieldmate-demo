import { ImageQuality } from '../../types'
import { processPhotoAsset } from '../../lib/media/imagePipeline'

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านข้อมูลภาพได้'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(blob)
  })
}

function loadImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('ไม่สามารถตรวจสอบคุณภาพภาพได้')) }
    image.src = url
  })
}

async function checkQuality(blob: Blob): Promise<ImageQuality> {
  const image = await loadImage(blob)
  const width = Math.min(320, image.width)
  const height = Math.max(1, Math.round(image.height * (width / image.width)))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('ไม่สามารถตรวจสอบคุณภาพภาพได้')
  context.drawImage(image, 0, 0, width, height)
  const pixels = context.getImageData(0, 0, width, height).data
  let brightnessTotal = 0
  let edgeTotal = 0
  let samples = 0
  let previous = 0
  for (let index = 0; index < pixels.length; index += 16) {
    const brightness = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114
    brightnessTotal += brightness
    if (samples > 0) edgeTotal += Math.abs(brightness - previous)
    previous = brightness
    samples += 1
  }
  const brightness = brightnessTotal / Math.max(1, samples)
  const edge = edgeTotal / Math.max(1, samples - 1)
  const blur = edge < 12
  const tooDark = brightness < 48
  const tooBright = brightness > 218
  const ratio = image.width / Math.max(1, image.height)
  const poorFraming = image.width < 720 || image.height < 720 || ratio < 0.45 || ratio > 2.2
  const recommendations = [
    blur ? 'ภาพไม่ชัด แนะนำให้ถือกล้องให้นิ่งและถ่ายใหม่' : '',
    tooDark ? 'ภาพมืดเกินไป แนะนำให้เพิ่มแสงหรือเปิดแฟลช' : '',
    tooBright ? 'ภาพสว่างเกินไป แนะนำให้หลีกเลี่ยงแสงสะท้อน' : '',
    poorFraming ? 'จัดกรอบภาพให้เห็นป้ายหรือทรัพย์ครบถ้วน' : '',
  ].filter(Boolean)
  return { score: Math.max(20, 100 - recommendations.length * 18), blur, tooDark, tooBright, poorFraming, recommendations }
}

export const imageService = {
  checkQuality,

  async process(blob: Blob, latitude: number | null, longitude: number | null) {
    const processed = await processPhotoAsset(blob, {
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
    }, { maxWidth: 1920, quality: 0.82, thumbWidth: 420 })
    const [originalImage, image, thumbnail] = await Promise.all([
      blobToDataUrl(processed.original),
      blobToDataUrl(processed.compressed),
      blobToDataUrl(processed.thumbnail),
    ])
    return { originalImage, image, thumbnail }
  },
}