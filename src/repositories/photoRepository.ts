import { apiClient } from '../lib/http/client'
import { env } from '../config/env'
import { isDevelopmentMode } from '../config/env'
import { enqueueOfflineItem } from '../lib/offline/queue'
import { apiEndpoints } from '../services/api/endpoints'
import { apiService } from '../services/api/apiService'

export type UploadedAsset = {
  key: string
  publicUrl: string
}

export type PhotoUploadInput = {
  propertyId: string
  metadata?: {
    latitude: number
    longitude: number
    capturedAtIso: string
    device: string
    accuracyMeters?: number
    heading?: number
  }
  thumbnail?: Blob
  onProgress?: (progress: number) => void
}

async function putToR2(file: Blob, key: string, input: PhotoUploadInput) {
  const target = `${env.r2UploadBaseUrl}/${key}`
  await apiClient.put(target, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Fieldmate-Meta': input.metadata ? JSON.stringify(input.metadata) : '',
    },
    onUploadProgress: (event) => {
      if (!input.onProgress || !event.total) return
      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      input.onProgress(progress)
    },
  })

  if (input.thumbnail) {
    const thumbKey = key.replace(/\.jpg$/i, '-thumb.jpg')
    const thumbTarget = `${env.r2UploadBaseUrl}/${thumbKey}`
    await apiClient.put(thumbTarget, input.thumbnail, {
      headers: { 'Content-Type': input.thumbnail.type || 'image/jpeg' },
    })
  }

  return { key, publicUrl: target }
}

export const photoRepository = {
  async uploadPhoto(file: Blob, input: PhotoUploadInput): Promise<UploadedAsset> {
    if (isDevelopmentMode) {
      input.onProgress?.(100)
      return { key: `demo-photo-${Date.now()}`, publicUrl: URL.createObjectURL(file) }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineItem({ method: 'post', url: apiEndpoints.photos.upload, data: { propertyId: input.propertyId, metadata: input.metadata }, entity: 'photo', conflictKey: input.propertyId })
      return { key: `queued-${Date.now()}`, publicUrl: '' }
    }
    const key = `properties/${input.propertyId}/photos/${Date.now()}.jpg`
    return putToR2(file, key, input)
  },
  async uploadDocument(file: Blob, propertyId: string): Promise<UploadedAsset> {
    if (isDevelopmentMode) {
      return { key: `demo-document-${Date.now()}`, publicUrl: URL.createObjectURL(file) }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineItem({ method: 'post', url: '/documents/upload', data: { propertyId }, entity: 'photo', conflictKey: propertyId })
      return { key: `queued-${Date.now()}`, publicUrl: '' }
    }
    const key = `properties/${propertyId}/documents/${Date.now()}.pdf`
    return putToR2(file, key, { propertyId })
  },
  async runOcr(propertyId: string, imageUrl: string) {
    if (isDevelopmentMode) {
      return [
        `Demo OCR result for ${propertyId}`,
        imageUrl || 'image-preview.jpg',
        'Microsoft Entra ID disabled in development mode',
      ]
    }

    const response = await apiService.post<{ lines: string[] }>(apiEndpoints.ai.ocr, { propertyId, imageUrl })
    return response.lines
  },
}
