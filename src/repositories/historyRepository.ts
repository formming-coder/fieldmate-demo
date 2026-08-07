import { apiClient } from '../lib/http/client'
import { isDevelopmentMode } from '../config/env'

export type HistoryRecord = {
  id: string
  action: string
  createdAt: string
  actor: string
}

export const historyRepository = {
  async list(limit = 50) {
    if (isDevelopmentMode) {
      return [
        {
          id: 'demo-history-1',
          action: 'Demo session started',
          createdAt: new Date().toISOString(),
          actor: 'Demo Officer',
        },
      ].slice(0, limit)
    }

    const response = await apiClient.get<HistoryRecord[]>(`/history?limit=${limit}`)
    return response.data
  },
  async create(action: string) {
    if (isDevelopmentMode) {
      return {
        id: `demo-history-${Date.now()}`,
        action,
        createdAt: new Date().toISOString(),
        actor: 'Demo Officer',
      }
    }

    const response = await apiClient.post<HistoryRecord>('/history', { action })
    return response.data
  },
}
