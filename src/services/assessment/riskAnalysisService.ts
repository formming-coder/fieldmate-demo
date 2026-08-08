import { Property, PropertySurvey, RiskAnalysis } from '../../types'

export const riskAnalysisService = {
  analyze(property: Property, survey: PropertySurvey, marketAverage: number): RiskAnalysis {
    const ocrResults = survey.photos.map((photo) => photo.ocrResult).filter(Boolean)
    const items: RiskAnalysis['items'] = [
      { id: 'location', label: 'ทำเล', level: survey.location?.confirmed ? 'ต่ำ' : 'สูง', detail: survey.location?.confirmed ? 'ยืนยันตำแหน่งภาคสนามแล้ว' : 'ยังไม่ยืนยันตำแหน่งภาคสนาม' },
      { id: 'condition', label: 'สภาพทรัพย์', level: survey.note.text ? 'ต่ำ' : 'ปานกลาง', detail: survey.note.text ? 'มีหมายเหตุสภาพทรัพย์จากผู้สำรวจ' : 'ควรเพิ่มรายละเอียดสภาพทรัพย์' },
      { id: 'incomplete', label: 'ข้อมูลไม่ครบ', level: survey.checklist.filter((item) => item.completed).length >= 6 ? 'ต่ำ' : 'ปานกลาง', detail: `สำรวจครบ ${survey.checklist.filter((item) => item.completed).length}/${survey.checklist.length} รายการ` },
      { id: 'price', label: 'ราคาประกาศสูงกว่าตลาด', level: property.marketPrice > marketAverage * 1.12 ? 'สูง' : property.marketPrice > marketAverage * 1.04 ? 'ปานกลาง' : 'ต่ำ', detail: 'เปรียบเทียบกับราคาเฉลี่ยของทรัพย์ที่เลือก' },
      { id: 'ocr', label: 'ข้อมูล OCR ไม่ชัดเจน', level: ocrResults.length ? 'ต่ำ' : 'ปานกลาง', detail: ocrResults.length ? 'พบผล OCR ที่บันทึกแล้ว' : 'ยังไม่มีผล OCR ที่ยืนยัน' },
      { id: 'gps', label: 'GPS ไม่ตรงตำแหน่ง', level: survey.location?.confirmed ? 'ต่ำ' : 'สูง', detail: survey.location?.confirmed ? 'ตำแหน่งได้รับการยืนยัน' : 'ควรตรวจสอบพิกัดอีกครั้ง' },
    ]
    const weight = { ต่ำ: 1, ปานกลาง: 2, สูง: 3 }
    const average = items.reduce((sum, item) => sum + weight[item.level], 0) / items.length
    return { items, overallLevel: average >= 2.35 ? 'สูง' : average >= 1.55 ? 'ปานกลาง' : 'ต่ำ' }
  },
}