import { apiClient } from '../lib/http/client'
import { isDevelopmentMode } from '../config/env'
import { enqueueOfflineItem } from '../lib/offline/queue'

export type AssessmentInput = {
  id?: string
  propertyId: string
  recommendation: number
  score: number
  note: string
  checklist: Array<{ key: string; checked: boolean }>
}

export const assessmentRepository = {
  async create(payload: AssessmentInput) {
    if (isDevelopmentMode) {
      return {
        id: payload.id || `demo-assessment-${Date.now()}`,
        queued: false,
      }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineItem({ method: 'post', url: '/assessments', data: payload, entity: 'assessment', conflictKey: payload.propertyId })
      return { queued: true }
    }

    const response = await apiClient.post('/assessments', payload)
    return response.data
  },
}
