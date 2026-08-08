export type Property = {
  id: string
  owner: string
  province: string
  address: string
  areaSqm: number
  latitude: number
  longitude: number
  marketPrice: number
  appraisalPrice: number
  status: 'inspected' | 'pending' | 'archived' | string
  type?: string
  lastInspection: string
  images: string[]
}

export type SurveyStatus = 'draft' | 'review' | 'saving' | 'completed'

export type SurveyPhotoType = 'front' | 'side' | 'rear' | 'road' | 'surroundings' | 'sign' | 'document' | 'other'

export type CameraState = 'camera' | 'preview' | 'processing' | 'result' | 'ocr-error' | 'saved'

export type OCRStatus = 'idle' | 'processing' | 'completed' | 'failed' | 'pending'

export type OCRConfidence = number

export type OCRField = {
  id: string
  label: string
  value: string
  confidence: OCRConfidence
}

export type OCRResult = {
  fields: OCRField[]
  fullText: string
  confidence: OCRConfidence
  provider: 'mock' | 'google' | 'azure' | 'other'
  processedAt: string
}

export type ImageQuality = {
  score: number
  blur: boolean
  tooDark: boolean
  tooBright: boolean
  poorFraming: boolean
  recommendations: string[]
}

export type PhotoMetadata = {
  propertyId: string
  surveyId: string
  photoId: string
  latitude: number | null
  longitude: number | null
  capturedAt: string
  date: string
  time: string
  category: SurveyPhotoType
}

export type CapturedPhoto = {
  id: string
  originalImage: string
  image: string
  thumbnail: string
  metadata: PhotoMetadata
  ocrStatus: OCRStatus
  ocrResult: OCRResult | null
  quality: ImageQuality
}

export type SurveyLocation = {
  latitude: number
  longitude: number
  accuracy: number
  capturedAt: string
  confirmed: boolean
}

export type SurveyPhoto = {
  id: string
  dataUrl: string
  latitude: number | null
  longitude: number | null
  capturedAt: string
  propertyId: string
  type: SurveyPhotoType
  surveyId?: string
  originalImage?: string
  thumbnailDataUrl?: string
  ocrStatus?: OCRStatus
  ocrResult?: OCRResult | null
  quality?: ImageQuality
}

export type SurveyChecklistItem = {
  id: 'front' | 'side' | 'rear' | 'road' | 'surroundings' | 'sign' | 'gps' | 'notes'
  label: string
  completed: boolean
}

export type SurveyNote = {
  text: string
  voicePlaceholder: boolean
  updatedAt: string
}

export type PropertySurvey = {
  id: string
  propertyId: string
  status: SurveyStatus
  location: SurveyLocation | null
  photos: SurveyPhoto[]
  checklist: SurveyChecklistItem[]
  note: SurveyNote
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export type AssessmentStatus = 'not-started' | 'analyzing' | 'analyzed' | 'pending-review' | 'edited' | 'completed'

export type ComparableProperty = {
  id: string
  propertyId: string
  title: string
  image: string
  type: string
  area: number
  price: number
  pricePerSqm: number
  distanceKm: number
  similarity: number
  updatedAt: string
  ageYears: number
  status: string
  selected: boolean
}

export type AssessmentConfidence = {
  dataCompleteness: number
  photoQuality: number
  locationConfidence: number
  comparableQuality: number
  ocrConfidence: number
  overallConfidence: number
}

export type AssessmentResult = {
  estimatedValue: number
  minimumValue: number
  maximumValue: number
  confidence: number
  confidenceLevel: 'สูง' | 'ปานกลาง' | 'ต่ำ'
  reasoning: string
}

export type AIAnalysis = {
  result: AssessmentResult
  recommendation: string
  calculation: {
    comparableAverage: number
    priceAdjustment: number
    locationAdjustment: number
    propertyConditionAdjustment: number
    areaAdjustment: number
    finalMinimum: number
    finalMaximum: number
  }
}

export type MarketAnalysis = {
  averageListingPrice: number
  averagePricePerSqm: number
  comparableCount: number
  averageDistanceKm: number
  trend: 'เพิ่มขึ้น' | 'ทรงตัว' | 'ลดลง'
  trendPercent: number
}

export type RiskLevel = 'ต่ำ' | 'ปานกลาง' | 'สูง'

export type RiskAnalysis = {
  items: Array<{ id: string; label: string; level: RiskLevel; detail: string }>
  overallLevel: RiskLevel
}

export type AssessmentOverride = {
  value: number | null
  note: string
  changed: boolean
}

export type Assessment = {
  id: string
  propertyId: string
  surveyId: string
  status: AssessmentStatus
  propertyData: Property
  photos: SurveyPhoto[]
  ocrResults: OCRResult[]
  comparables: ComparableProperty[]
  aiAnalysis: AIAnalysis
  marketAnalysis: MarketAnalysis
  riskAnalysis: RiskAnalysis
  confidence: AssessmentConfidence
  override: AssessmentOverride
  note: string
  timestamp: string
  gps: SurveyLocation | null
  exportPreparation: {
    pdfReady: boolean
    excelReady: boolean
    reportVersion: number
  }
}

export type Task = {
  id: string
  title: string
  propertyId: string
  scheduledAt: string
  status: string
}

export type User = {
  id: string
  name: string
  role?: string
  email?: string
  avatar?: string | null
}

export type Notification = {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}
