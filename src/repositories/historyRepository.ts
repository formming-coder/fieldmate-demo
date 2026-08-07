import { apiClient } from '../lib/http/client'

export type HistoryRecord = {
  id: string
  action: string
  createdAt: string
  actor: string
}

export const historyRepository = {
  async list(limit = 50) {
    const response = await apiClient.get<HistoryRecord[]>(`/history?limit=${limit}`)
    return response.data
  },
  async create(action: string) {
    const response = await apiClient.post<HistoryRecord>('/history', { action })
    return response.data
  },
}
