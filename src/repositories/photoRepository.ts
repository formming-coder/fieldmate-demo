import { apiClient } from '../lib/http/client'
import { env } from '../config/env'
import { isDevelopmentMode } from '../config/env'
import { enqueueOfflineItem } from '../lib/offline/queue'

export type UploadedAsset = {
  key: string
  publicUrl: string
}

async function putToR2(file: Blob, key: string) {
  const target = `${env.r2UploadBaseUrl}/${key}`
  await apiClient.put(target, file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  })
  return { key, publicUrl: target }
}

export const photoRepository = {
  async uploadPhoto(file: Blob, propertyId: string): Promise<UploadedAsset> {
    if (isDevelopmentMode) {
      return { key: `demo-photo-${Date.now()}`, publicUrl: URL.createObjectURL(file) }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineItem({ method: 'post', url: '/photos/upload', data: { propertyId }, entity: 'photo', conflictKey: propertyId })
      return { key: `queued-${Date.now()}`, publicUrl: '' }
    }
    const key = `properties/${propertyId}/photos/${Date.now()}.jpg`
    return putToR2(file, key)
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
    return putToR2(file, key)
  },
  async runOcr(propertyId: string, imageUrl: string) {
    if (isDevelopmentMode) {
      return [
        `Demo OCR result for ${propertyId}`,
        imageUrl || 'image-preview.jpg',
        'Microsoft Entra ID disabled in development mode',
      ]
    }

    const response = await apiClient.post<{ lines: string[] }>('/ocr/extract', { propertyId, imageUrl })
    return response.data.lines
  },
}
