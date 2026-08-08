import { ListingPropertyType, OCRResult, PropertyListingForm, SurveyPhotoType } from '../types'

export type ListingDraftInput = Omit<PropertyListingForm, 'totalLandSqWah' | 'pricePerSqWah' | 'createdAt' | 'updatedAt'>

export function calculateLandArea(rai: number, ngan: number, sqWah: number) {
  return (Number(rai) || 0) * 400 + (Number(ngan) || 0) * 100 + (Number(sqWah) || 0)
}

export function calculatePricePerSqWah(price: number, totalLandSqWah: number) {
  if (!Number.isFinite(price) || !Number.isFinite(totalLandSqWah) || totalLandSqWah <= 0) return null
  return price / totalLandSqWah
}

export function parseNumericValue(value: string) {
  const parsed = Number(value.replace(/,/g, '').replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatThaiNumber(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString('th-TH', { maximumFractionDigits })
}

export function normalizeThaiPhone(value: string) {
  return value.replace(/[^\d]/g, '').slice(0, 10)
}

export function isValidThaiPhone(value: string) {
  const digits = normalizeThaiPhone(value)
  return digits === '' || /^0[689]\d{8}$/.test(digits) || /^0[2-7]\d{7,8}$/.test(digits)
}

function findOcrValue(result: OCRResult | null, ids: string[], labels: string[]) {
  const field = result?.fields.find((item) => ids.includes(item.id) || labels.some((label) => item.label.includes(label)))
  return field?.value || ''
}

export function getListingOcrPrefill(result: OCRResult | null) {
  const priceText = findOcrValue(result, ['price'], ['ราคา'])
  const phoneText = findOcrValue(result, ['phone'], ['โทร', 'เบอร์'])
  const propertyTypeText = findOcrValue(result, ['propertyType'], ['ประเภททรัพย์'])
  const supportedTypes: ListingPropertyType[] = ['ที่ดิน', 'บ้านเดี่ยว', 'บ้านแฝด', 'ทาวน์เฮ้าส์', 'ตึกแถว']
  return {
    price: parseNumericValue(priceText),
    phone: normalizeThaiPhone(phoneText),
    propertyType: supportedTypes.find((type) => propertyTypeText.includes(type)) || null,
  }
}

export function createPropertyListing(input: ListingDraftInput, existingCreatedAt?: string): PropertyListingForm {
  const now = new Date().toISOString()
  const totalLandSqWah = calculateLandArea(input.landRai, input.landNgan, input.landSqWah)
  return {
    ...input,
    totalLandSqWah,
    pricePerSqWah: calculatePricePerSqWah(input.price, totalLandSqWah),
    createdAt: existingCreatedAt || now,
    updatedAt: now,
  }
}

export function createEmptyListingInput(input: {
  propertyType: ListingPropertyType
  propertyId: string
  surveyId: string
  photoId: string
  photoCategory: SurveyPhotoType
  latitude: number | null
  longitude: number | null
  ocrResult: OCRResult | null
}): ListingDraftInput {
  const prefill = getListingOcrPrefill(input.ocrResult)
  return {
    propertyType: input.propertyType,
    price: prefill.price,
    phone: prefill.phone,
    notes: '',
    landRai: 0,
    landNgan: 0,
    landSqWah: 0,
    floors: null,
    bedrooms: null,
    bathrooms: null,
    usableAreaSqm: null,
    latitude: input.latitude,
    longitude: input.longitude,
    photoIds: [input.photoId],
    photoCategory: input.photoCategory,
    propertyId: input.propertyId,
    surveyId: input.surveyId,
  }
}