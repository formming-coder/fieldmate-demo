import { Assessment } from '../../types'

const RESULT_KEY = 'fieldmate-assessments'

export const assessmentService = {
  draftKey(propertyId: string, surveyId: string) { return `fieldmate-assessment-draft:${propertyId}:${surveyId}` },
  readDraft(propertyId: string, surveyId: string): Assessment | null {
    try { const raw = localStorage.getItem(this.draftKey(propertyId, surveyId)); return raw ? JSON.parse(raw) as Assessment : null } catch { return null }
  },
  saveDraft(assessment: Assessment) { localStorage.setItem(this.draftKey(assessment.propertyId, assessment.surveyId), JSON.stringify(assessment)) },
  save(assessment: Assessment) {
    const raw = localStorage.getItem(RESULT_KEY)
    const existing = raw ? JSON.parse(raw) as Record<string, Assessment> : {}
    localStorage.setItem(RESULT_KEY, JSON.stringify({ ...existing, [assessment.id]: assessment }))
    localStorage.removeItem(this.draftKey(assessment.propertyId, assessment.surveyId))
    return assessment
  },
  prepareExport(assessment: Assessment) {
    return { assessmentId: assessment.id, formats: ['PDF', 'Excel', 'Report'], generatedAt: assessment.timestamp, payload: assessment }
  },
}