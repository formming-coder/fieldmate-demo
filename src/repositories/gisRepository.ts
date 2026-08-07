import { apiClient } from '../lib/http/client'

export type GISOverlay = {
  key: string
  active: boolean
  opacity: number
  description: string
}

export const gisRepository = {
  async overlays() {
    const response = await apiClient.get<GISOverlay[]>('/gis/overlays')
    return response.data
  },
}
