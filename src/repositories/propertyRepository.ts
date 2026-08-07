import { isDevelopmentMode } from '../config/env'
import { enqueueOfflineItem } from '../lib/offline/queue'
import mockProperties from '../mock/properties.json'
import { Property } from '../types'
import { apiEndpoints } from '../services/api/endpoints'
import { apiService } from '../services/api/apiService'

const PROPERTY_CACHE_KEY = 'fieldmate:cache:properties'

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

function readPropertyCache() {
  if (typeof window === 'undefined') return [] as Property[]
  try {
    const raw = window.localStorage.getItem(PROPERTY_CACHE_KEY)
    return raw ? (JSON.parse(raw) as Property[]) : []
  } catch {
    return []
  }
}

function writePropertyCache(items: Property[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PROPERTY_CACHE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export const propertyRepository = {
  async list() {
    if (isDevelopmentMode) {
      return (mockProperties as PropertyRecord[]).map(toProperty)
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return readPropertyCache()
    }

    const response = await apiService.get<PropertyRecord[]>(apiEndpoints.properties.list)
    const mapped = response.map(toProperty)
    writePropertyCache(mapped)
    return mapped
  },
  async getById(id: string) {
    if (isDevelopmentMode) {
      const record = (mockProperties as PropertyRecord[]).find((item) => item.id === id)
      if (!record) {
        throw new Error('Property not found')
      }
      return toProperty(record)
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const cached = readPropertyCache().find((item) => item.id === id)
      if (cached) return cached
    }

    const response = await apiService.get<PropertyRecord>(apiEndpoints.properties.update(id))
    const mapped = toProperty(response)
    const current = readPropertyCache().filter((item) => item.id !== mapped.id)
    writePropertyCache([mapped, ...current])
    return mapped
  },
  async create(payload: PropertyCreateInput) {
    if (isDevelopmentMode) {
      return {
        ...(payload as Property),
        id: payload.id || `demo-${Date.now()}`,
        owner: payload.owner || 'Demo owner',
        province: payload.province || 'Bangkok',
        latitude: payload.latitude || 13.7563,
        longitude: payload.longitude || 100.5018,
        marketPrice: payload.marketPrice || 0,
        appraisalPrice: payload.appraisalPrice || 0,
        status: payload.status || 'pending',
        type: payload.type,
        lastInspection: payload.lastInspection || new Date().toISOString(),
        images: payload.images || [],
      }
    }

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

    const response = await apiService.post<PropertyRecord>(apiEndpoints.properties.create, payload)
    return toProperty(response)
  },
}
