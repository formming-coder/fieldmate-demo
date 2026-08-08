import { env } from '../../config/env'
import { OCRField, OCRResult } from '../../types'

export type OCRAnalyzeInput = {
  image: string
  propertyId: string
  signal?: AbortSignal
}

export interface OCRService {
  analyze(input: OCRAnalyzeInput): Promise<OCRResult>
}

const mockFields: OCRField[] = [
  { id: 'price', label: 'ราคาขาย', value: '3,500,000 บาท', confidence: 0.96 },
  { id: 'phone', label: 'โทรศัพท์', value: '089-234-5678', confidence: 0.94 },
  { id: 'project', label: 'โครงการ', value: 'บ้านกลางเมือง สุขุมวิท 77', confidence: 0.91 },
  { id: 'seller', label: 'ชื่อผู้ขาย/นายหน้า', value: 'บริษัท กรุงเทพ พร็อพเพอร์ตี้ จำกัด', confidence: 0.88 },
  { id: 'propertyType', label: 'ประเภททรัพย์', value: 'บ้านเดี่ยว', confidence: 0.93 },
  { id: 'area', label: 'พื้นที่', value: '50 ตร.ว.', confidence: 0.95 },
  { id: 'website', label: 'เว็บไซต์', value: 'www.bangkokproperty.co.th', confidence: 0.86 },
  { id: 'line', label: 'LINE ID', value: '@bkm77', confidence: 0.89 },
]

class MockOCRService implements OCRService {
  async analyze({ propertyId, signal }: OCRAnalyzeInput): Promise<OCRResult> {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, 1050)
      signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('ยกเลิกการอ่านภาพ', 'AbortError')) }, { once: true })
    })
    if (env.ocrMockFail) throw new Error('ไม่สามารถอ่านข้อมูลจากภาพได้')
    return {
      fields: mockFields.map((field) => ({ ...field })),
      fullText: `ประกาศขาย ${propertyId} บ้านเดี่ยว โครงการบ้านกลางเมือง สุขุมวิท 77 ราคา 3,500,000 บาท โทร 089-234-5678 พื้นที่ 50 ตร.ว.`,
      confidence: 0.94,
      provider: 'mock',
      processedAt: new Date().toISOString(),
    }
  }
}

class BackendOCRService implements OCRService {
  async analyze(input: OCRAnalyzeInput): Promise<OCRResult> {
    const response = await fetch(env.ocrApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: input.image, propertyId: input.propertyId, provider: env.ocrProvider }),
      signal: input.signal,
    })
    if (!response.ok) throw new Error('ไม่สามารถอ่านข้อมูลจากภาพได้')
    return response.json() as Promise<OCRResult>
  }
}

export const ocrService: OCRService = env.ocrApiUrl && env.ocrProvider !== 'mock' ? new BackendOCRService() : new MockOCRService()