import { apiClient } from '../lib/http/client'
import { isDevelopmentMode } from '../config/env'

export type HistoryRecord = {
  id: string
  propertyId?: string
  action: string
  createdAt: string
  actor: string
}

type HistoryCreateInput = {
  action: string
  actor?: string
  propertyId?: string
  createdAt?: string
}

const HISTORY_CACHE_KEY = 'fieldmate:history:records'

function readHistoryCache() {
  if (typeof window === 'undefined') return [] as HistoryRecord[]
  try {
    const raw = window.localStorage.getItem(HISTORY_CACHE_KEY)
    return raw ? (JSON.parse(raw) as HistoryRecord[]) : []
  } catch {
    return []
  }
}

function writeHistoryCache(items: HistoryRecord[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

function seedHistory(propertyId?: string): HistoryRecord[] {
  const now = Date.now()
  return [
    {
      id: `demo-history-${propertyId || 'property'}-1`,
      propertyId,
      action: 'บันทึกทรัพย์ภาคสนาม',
      createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
      actor: 'Demo Officer',
    },
    {
      id: `demo-history-${propertyId || 'property'}-2`,
      propertyId,
      action: 'อัปเดตข้อมูลภายหลัง',
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      actor: 'Demo Officer',
    },
    {
      id: `demo-history-${propertyId || 'property'}-3`,
      propertyId,
      action: 'เพิ่มรูปภาพใหม่',
      createdAt: new Date(now - 1000 * 60 * 10).toISOString(),
      actor: 'Demo Officer',
    },
  ]
}

function sortHistory(items: HistoryRecord[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const historyRepository = {
  async list(propertyId?: string, limit = 50) {
    if (isDevelopmentMode || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      const cached = readHistoryCache().filter((item) => !propertyId || item.propertyId === propertyId)
      const seeds = seedHistory(propertyId)
      const records = sortHistory([...cached, ...seeds.filter((seed) => !cached.some((item) => item.id === seed.id))])
      return records.slice(0, limit)
    }

    const response = await apiClient.get<HistoryRecord[]>(`/history?limit=${limit}${propertyId ? `&propertyId=${encodeURIComponent(propertyId)}` : ''}`)
    const merged = [...response.data, ...readHistoryCache().filter((item) => !propertyId || item.propertyId === propertyId)]
    return sortHistory(merged).slice(0, limit)
  },
  async create(input: HistoryCreateInput) {
    const record: HistoryRecord = {
      id: `demo-history-${Date.now()}`,
      propertyId: input.propertyId,
      action: input.action,
      createdAt: input.createdAt || new Date().toISOString(),
      actor: input.actor || 'Demo Officer',
    }

    const next = sortHistory([record, ...readHistoryCache().filter((item) => item.id !== record.id)])
    writeHistoryCache(next)

    if (isDevelopmentMode || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return record
    }

    const response = await apiClient.post<HistoryRecord>('/history', record)
    return response.data
  },
}
