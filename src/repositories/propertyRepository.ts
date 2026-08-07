import { apiClient } from '../lib/http/client'
import { enqueueOfflineItem } from '../lib/offline/queue'
import { Property } from '../types'

type PropertyCreateInput = Partial<Property>

type PropertyRecord = {
  id: string
  owner: string
  province: string
  latitude: number
  longitude: number
  marketPrice?: number
  appraisalPrice?: number
  market_price?: number
  appraisal_price?: number
  status: string
  type?: string
  lastInspection?: string
  last_inspection?: string
  images: string[] | string
}

function toProperty(record: PropertyRecord): Property {
  let rawImages: string[] = []
  if (Array.isArray(record.images)) {
    rawImages = record.images
  } else if (typeof record.images === 'string') {
    try {
      rawImages = JSON.parse(record.images || '[]') as string[]
    } catch {
      rawImages = []
    }
  }

  return {
    id: record.id,
    owner: record.owner,
    province: record.province,
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
    marketPrice: Number(record.marketPrice ?? record.market_price ?? 0),
    appraisalPrice: Number(record.appraisalPrice ?? record.appraisal_price ?? 0),
    status: record.status,
    type: record.type,
    lastInspection: record.lastInspection || record.last_inspection || new Date().toISOString(),
    images: rawImages,
  }
}

export const propertyRepository = {
  async list() {
    const response = await apiClient.get<PropertyRecord[]>('/properties')
    return response.data.map(toProperty)
  },
  async getById(id: string) {
    const response = await apiClient.get<PropertyRecord>(`/properties/${id}`)
    return toProperty(response.data)
  },
  async create(payload: PropertyCreateInput) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineItem({ method: 'post', url: '/properties', data: payload, entity: 'property' })
      return {
        ...(payload as Property),
        id: payload.id || `queued-${Date.now()}`,
        owner: payload.owner || 'Unknown owner',
        province: payload.province || 'Unknown province',
        latitude: payload.latitude || 0,
        longitude: payload.longitude || 0,
        marketPrice: payload.marketPrice || 0,
        appraisalPrice: payload.appraisalPrice || 0,
        status: payload.status || 'pending',
        lastInspection: payload.lastInspection || new Date().toISOString(),
        images: payload.images || [],
      }
    }

    const response = await apiClient.post<PropertyRecord>('/properties', payload)
    return toProperty(response.data)
  },
}
