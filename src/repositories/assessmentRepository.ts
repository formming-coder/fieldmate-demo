import { apiClient } from '../lib/http/client'
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
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineItem({ method: 'post', url: '/assessments', data: payload, entity: 'assessment', conflictKey: payload.propertyId })
      return { queued: true }
    }

    const response = await apiClient.post('/assessments', payload)
    return response.data
  },
}
