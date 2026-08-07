import { isDevelopmentMode } from '../../config/env'
import { apiEndpoints } from '../api/endpoints'
import { apiService } from '../api/apiService'

export type AiSummaryPayload = {
  propertyId: string
  textContext: string
}

export const aiService = {
  async runOcr(imageUrl: string) {
    if (isDevelopmentMode) {
      return { lines: ['OCR mock: ตรวจพบข้อความจากภาพ', imageUrl] }
    }
    return apiService.post<{ lines: string[] }>(apiEndpoints.ai.ocr, { imageUrl })
  },

  async propertySummary(payload: AiSummaryPayload) {
    if (isDevelopmentMode) {
      return {
        summary: 'สรุปทรัพย์สินจาก AI (โหมดจำลอง)',
        confidence: 0.9,
      }
    }
    return apiService.post<{ summary: string; confidence: number }>(apiEndpoints.ai.summary, payload)
  },

  async comparableRecommendation(propertyId: string) {
    if (isDevelopmentMode) {
      return { items: ['เทียบเคียง A', 'เทียบเคียง B', 'เทียบเคียง C'] }
    }
    return apiService.post<{ items: string[] }>(apiEndpoints.ai.comparable, { propertyId })
  },

  async priceSuggestion(propertyId: string) {
    if (isDevelopmentMode) {
      return { price: 7800000, confidence: 0.87 }
    }
    return apiService.post<{ price: number; confidence: number }>(apiEndpoints.ai.price, { propertyId })
  },

  async riskAnalysis(propertyId: string) {
    if (isDevelopmentMode) {
      return { risk: 'moderate', score: 0.46 }
    }
    return apiService.post<{ risk: string; score: number }>(apiEndpoints.ai.risk, { propertyId })
  },

  async imageCaption(imageUrl: string) {
    if (isDevelopmentMode) {
      return { caption: 'ภาพภายนอกทรัพย์สินพร้อมทางเข้าออกชัดเจน' }
    }
    return apiService.post<{ caption: string }>(apiEndpoints.ai.caption, { imageUrl })
  },
}
