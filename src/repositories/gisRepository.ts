import { apiClient } from '../lib/http/client'
import { isDevelopmentMode } from '../config/env'

export type GISOverlay = {
  key: string
  active: boolean
  opacity: number
  description: string
}

export const gisRepository = {
  async overlays() {
    if (isDevelopmentMode) {
      return [
        { key: 'forest', active: true, opacity: 0.42, description: 'Forest coverage' },
        { key: 'flood', active: true, opacity: 0.36, description: 'Flood risk' },
        { key: 'urban', active: false, opacity: 0.28, description: 'Urban planning' },
        { key: 'expropriation', active: false, opacity: 0.32, description: 'Expropriation watch' },
      ]
    }

    const response = await apiClient.get<GISOverlay[]>('/gis/overlays')
    return response.data
  },
}
