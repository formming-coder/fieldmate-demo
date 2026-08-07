import { isDevelopmentMode } from '../config/env'
import { enqueueOfflineItem } from '../lib/offline/queue'
import { apiEndpoints } from '../services/api/endpoints'
import { apiService } from '../services/api/apiService'

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
      enqueueOfflineItem({ method: 'post', url: apiEndpoints.assessments.create, data: payload, entity: 'assessment', conflictKey: payload.propertyId })
      return { queued: true }
    }

    return apiService.post(apiEndpoints.assessments.create, payload)
  },
}
