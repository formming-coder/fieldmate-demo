import { AIAnalysis, AssessmentConfidence, ComparableProperty, Property, PropertySurvey } from '../../types'

export type AIAssessmentInput = { property: Property; survey: PropertySurvey; comparables: ComparableProperty[] }

export interface AIAssessmentService {
  analyze(input: AIAssessmentInput): { analysis: AIAnalysis; confidence: AssessmentConfidence }
}

class DeterministicAIAssessmentService implements AIAssessmentService {
  analyze({ property, survey, comparables }: AIAssessmentInput) {
    const count = Math.max(1, comparables.length)
    const comparableAverage = Math.round(comparables.reduce((sum, item) => sum + item.price, 0) / count)
    const averageDistance = comparables.reduce((sum, item) => sum + item.distanceKm, 0) / count
    const priceAdjustment = Math.max(-0.04, Math.min(0.04, ((property.marketPrice - comparableAverage) / Math.max(1, comparableAverage)) * 0.18))
    const locationAdjustment = averageDistance <= 1 ? 0.03 : averageDistance <= 3 ? 0.01 : -0.02
    const qualityScores = survey.photos.map((photo) => photo.quality?.score || 72)
    const photoQuality = qualityScores.length ? Math.round(qualityScores.reduce((sum, value) => sum + value, 0) / qualityScores.length) : 45
    const propertyConditionAdjustment = photoQuality >= 80 ? 0.025 : photoQuality >= 60 ? 0 : -0.035
    const hasArea = survey.photos.some((photo) => photo.ocrResult?.fields.some((field) => field.id === 'area' && field.value))
    const areaAdjustment = hasArea ? 0.01 : -0.01
    const estimatedValue = Math.round((comparableAverage * (1 + priceAdjustment + locationAdjustment + propertyConditionAdjustment + areaAdjustment)) / 1000) * 1000
    const minimumValue = Math.round((estimatedValue * 0.95) / 1000) * 1000
    const maximumValue = Math.round((estimatedValue * 1.05) / 1000) * 1000
    const completed = survey.checklist.filter((item) => item.completed).length
    const ocrValues = survey.photos.map((photo) => photo.ocrResult?.confidence).filter((value): value is number => typeof value === 'number')
    const ocrConfidence = ocrValues.length ? Math.round((ocrValues.reduce((sum, value) => sum + value, 0) / ocrValues.length) * 100) : 55
    const confidence: AssessmentConfidence = {
      dataCompleteness: Math.round((completed / Math.max(1, survey.checklist.length)) * 100),
      photoQuality,
      locationConfidence: survey.location?.confirmed ? Math.max(72, Math.min(98, 100 - Math.round(survey.location.accuracy))) : 35,
      comparableQuality: Math.round(comparables.reduce((sum, item) => sum + item.similarity, 0) / count),
      ocrConfidence,
      overallConfidence: 0,
    }
    confidence.overallConfidence = Math.round((confidence.dataCompleteness + confidence.photoQuality + confidence.locationConfidence + confidence.comparableQuality + confidence.ocrConfidence) / 5)
    const result = {
      estimatedValue,
      minimumValue,
      maximumValue,
      confidence: confidence.overallConfidence,
      confidenceLevel: confidence.overallConfidence >= 80 ? 'สูง' as const : confidence.overallConfidence >= 60 ? 'ปานกลาง' as const : 'ต่ำ' as const,
      reasoning: `ผลวิเคราะห์เบื้องต้นจาก AI อยู่ในช่วงเดียวกับทรัพย์เปรียบเทียบ ${comparables.length} รายการ โดยพิจารณาจากประเภททรัพย์ พื้นที่ ทำเล สภาพภาพถ่าย และข้อมูลภาคสนาม`,
    }
    return {
      confidence,
      analysis: {
        result,
        recommendation: confidence.dataCompleteness < 75 ? 'ควรตรวจสอบสภาพทรัพย์และเอกสารเพิ่มเติมก่อนสรุปผล' : 'ข้อมูลมีความพร้อมในระดับดี ควรให้ผู้ประเมินตรวจสอบราคาทรัพย์เปรียบเทียบก่อนสรุปผล',
        calculation: { comparableAverage, priceAdjustment, locationAdjustment, propertyConditionAdjustment, areaAdjustment, finalMinimum: minimumValue, finalMaximum: maximumValue },
      },
    }
  }
}

export const aiAssessmentService: AIAssessmentService = new DeterministicAIAssessmentService()