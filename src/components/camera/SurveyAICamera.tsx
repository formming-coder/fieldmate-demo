import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../Layout'
import { useDeviceCamera } from '../../hooks/useDeviceCamera'
import { useLiveLocation } from '../../hooks/useLiveLocation'
import { imageService } from '../../services/camera/imageService'
import { ocrService } from '../../services/ocr/ocrService'
import { photoStorageService } from '../../services/camera/photoStorageService'
import { CameraState, CapturedPhoto, ImageQuality, ListingPropertyType, OCRResult as OCRResultType, OCRStatus, PropertyListingForm as PropertyListingData, PropertySurvey, SurveyPhotoType } from '../../types'
import { createEmptyListingInput, formatThaiNumber, ListingDraftInput } from '../../utils/propertyListing'
import CameraPreview from './CameraPreview'
import CameraControls from './CameraControls'
import CameraPermission from './CameraPermission'
import PhotoPreview from './PhotoPreview'
import ImageQualityCheck from './ImageQualityCheck'
import OCRProcessing from './OCRProcessing'
import OCRResult from './OCRResult'
import PropertyTypeSelector from '../property-listing/PropertyTypeSelector'
import PropertyListingForm from '../property-listing/PropertyListingForm'
import '../../styles/camera-survey.css'

const categories: Array<{ id: SurveyPhotoType; label: string }> = [
  { id: 'front', label: 'ด้านหน้า' }, { id: 'side', label: 'ด้านข้าง' },
  { id: 'rear', label: 'ด้านหลัง' }, { id: 'road', label: 'ถนน' },
  { id: 'surroundings', label: 'บริเวณโดยรอบ' }, { id: 'sign', label: 'ป้ายประกาศ' },
  { id: 'document', label: 'เอกสาร' }, { id: 'other', label: 'อื่น ๆ' },
]

const emptyQuality: ImageQuality = { score: 100, blur: false, tooDark: false, tooBright: false, poorFraming: false, recommendations: [] }

type SurveyAICameraProps = { propertyId: string; surveyId: string; sourcePhotoId?: string; initialCategory?: SurveyPhotoType; returnTo?: 'survey' | 'assessment' }

export default function SurveyAICamera({ propertyId, surveyId, sourcePhotoId, initialCategory, returnTo = 'survey' }: SurveyAICameraProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const previewUrlRef = useRef('')
  const sourceLoadedRef = useRef(false)
  const [state, setState] = useState<CameraState>('camera')
  const [category, setCategory] = useState<SurveyPhotoType>(initialCategory || 'sign')
  const [analyzeOCR, setAnalyzeOCR] = useState(initialCategory ? initialCategory === 'sign' : true)
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [quality, setQuality] = useState<ImageQuality>(emptyQuality)
  const [stage, setStage] = useState(0)
  const [preparedPhoto, setPreparedPhoto] = useState<CapturedPhoto | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResultType | null>(null)
  const [message, setMessage] = useState('')
  const [listingInitial, setListingInitial] = useState<ListingDraftInput | null>(null)
  const [savedListing, setSavedListing] = useState<PropertyListingData | null>(null)
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const [flashActive, setFlashActive] = useState(false)
  const { videoRef, permission, error: cameraError, loading, torchEnabled, torchAvailable, requestCamera, capturePhoto, switchCamera, toggleTorch, stopCamera } = useDeviceCamera()
  const { location } = useLiveLocation({ highAccuracy: true, watch: true, timeoutMs: 12000 })
  const returnPath = returnTo === 'assessment'
    ? `/assessment?propertyId=${encodeURIComponent(propertyId)}&surveyId=${encodeURIComponent(surveyId)}`
    : `/survey/${encodeURIComponent(propertyId)}?step=photos&cameraReturn=1`
  const listingDraftKey = `fieldmate-property-listing-draft:${surveyId}`

  useEffect(() => { void requestCamera('environment') }, [requestCamera])
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync) }
  }, [])
  useEffect(() => { previewUrlRef.current = previewUrl }, [previewUrl])
  useEffect(() => () => { if (previewUrlRef.current.startsWith('blob:')) URL.revokeObjectURL(previewUrlRef.current) }, [])

  useEffect(() => {
    if (sourcePhotoId) return
    try {
      const rawListing = window.localStorage.getItem(listingDraftKey)
      const rawSurvey = window.localStorage.getItem(`fieldmate-survey-draft:${propertyId}`)
      if (!rawListing || !rawSurvey) return
      const restored = JSON.parse(rawListing) as ListingDraftInput
      const survey = JSON.parse(rawSurvey) as PropertySurvey
      const photo = survey.photos.find((item) => restored.photoIds.includes(item.id))
      if (!photo || restored.surveyId !== surveyId) return
      setPreparedPhoto({
        id: photo.id,
        originalImage: photo.originalImage || photo.dataUrl,
        image: photo.dataUrl,
        thumbnail: photo.thumbnailDataUrl || photo.dataUrl,
        metadata: {
          propertyId,
          surveyId,
          photoId: photo.id,
          latitude: photo.latitude,
          longitude: photo.longitude,
          capturedAt: photo.capturedAt,
          date: new Date(photo.capturedAt).toLocaleDateString('th-TH'),
          time: new Date(photo.capturedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          category: photo.type,
          propertyType: restored.propertyType,
        },
        ocrStatus: photo.ocrStatus || 'idle',
        ocrResult: photo.ocrResult || null,
        quality: photo.quality || emptyQuality,
      })
      setListingInitial(restored)
      setState('listing-form')
      stopCamera()
    } catch {
      window.localStorage.removeItem(listingDraftKey)
    }
  }, [listingDraftKey, propertyId, sourcePhotoId, stopCamera, surveyId])

  const resetCapture = () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setSourceFile(null)
    setPreviewUrl('')
    setPreparedPhoto(null)
    setOcrResult(null)
    setMessage('')
    setQuality(emptyQuality)
    setState('camera')
  }

  const preparePreview = async (file: File, url?: string) => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    const nextUrl = url || URL.createObjectURL(file)
    setSourceFile(file)
    setPreviewUrl(nextUrl)
    setQuality(await imageService.checkQuality(file).catch(() => emptyQuality))
    setState('preview')
  }

  useEffect(() => {
    if (!sourcePhotoId || sourceLoadedRef.current) return
    sourceLoadedRef.current = true
    try {
      const raw = window.localStorage.getItem(`fieldmate-survey-draft:${propertyId}`)
      const survey = raw ? JSON.parse(raw) as { photos?: Array<{ id: string; dataUrl: string; type: SurveyPhotoType }> } : null
      const source = survey?.photos?.find((photo) => photo.id === sourcePhotoId)
      if (!source) { setMessage('ไม่พบรูปภาพที่เลือกในแบบสำรวจ'); return }
      setCategory(source.type)
      setAnalyzeOCR(true)
      void fetch(source.dataUrl).then((response) => response.blob()).then((blob) => preparePreview(new File([blob], `${source.id}.jpg`, { type: blob.type || 'image/jpeg' })))
    } catch {
      setMessage('ไม่สามารถเปิดรูปภาพที่เลือกได้')
    }
  }, [propertyId, sourcePhotoId])

  const takePhoto = async () => {
    const capture = await capturePhoto()
    if (!capture) { setMessage('ไม่สามารถถ่ายรูปได้ กรุณาลองใหม่'); return }
    setFlashActive(true)
    window.setTimeout(() => setFlashActive(false), 180)
    await preparePreview(capture.file, capture.url)
  }

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) void preparePreview(file)
    event.target.value = ''
  }

  const createPhoto = async (status: OCRStatus, result: OCRResultType | null) => {
    if (!sourceFile) throw new Error('ไม่พบภาพที่เลือก')
    let surveyLocation: { latitude: number; longitude: number } | null = null
    try {
      const rawSurvey = window.localStorage.getItem(`fieldmate-survey-draft:${propertyId}`)
      surveyLocation = rawSurvey ? (JSON.parse(rawSurvey) as PropertySurvey).location : null
    } catch {
      surveyLocation = null
    }
    const latitude = location?.latitude ?? surveyLocation?.latitude ?? null
    const longitude = location?.longitude ?? surveyLocation?.longitude ?? null
    const processed = await imageService.process(sourceFile, latitude, longitude)
    const now = new Date()
    const photoId = sourcePhotoId || `survey-photo-${Date.now()}`
    return {
      id: photoId,
      ...processed,
      metadata: {
        propertyId,
        surveyId,
        photoId,
        latitude,
        longitude,
        capturedAt: now.toISOString(),
        date: now.toLocaleDateString('th-TH'),
        time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        category,
      },
      ocrStatus: status,
      ocrResult: result,
      quality,
    } satisfies CapturedPhoto
  }

  const savePhoto = async (photo: CapturedPhoto, successMessage: string) => {
    try {
      await photoStorageService.attachToSurvey(photo)
      setPreparedPhoto(photo)
      setMessage(successMessage)
      setState('property-type')
      stopCamera()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ไม่สามารถบันทึกรูปลงแบบสำรวจได้')
    }
  }

  const runOCR = async (photo: CapturedPhoto) => {
    setPreparedPhoto(photo)
    setState('processing')
    setStage(1)
    const timer = window.setInterval(() => setStage((current) => Math.min(3, current + 1)), 420)
    try {
      const result = await ocrService.analyze({ image: photo.image, propertyId })
      setOcrResult(result)
      setPreparedPhoto({ ...photo, ocrStatus: 'completed', ocrResult: result })
      setState('result')
    } catch {
      setPreparedPhoto({ ...photo, ocrStatus: 'failed', ocrResult: null })
      setState('ocr-error')
    } finally {
      window.clearInterval(timer)
      setStage(3)
    }
  }

  const usePhoto = async () => {
    setMessage('')
    setState('processing')
    setStage(0)
    try {
      const status: OCRStatus = offline && analyzeOCR ? 'pending' : analyzeOCR ? 'processing' : 'idle'
      const photo = await createPhoto(status, null)
      if (offline) {
        await savePhoto(photo, analyzeOCR ? 'บันทึกภาพแล้ว จะวิเคราะห์เมื่อเชื่อมต่ออินเทอร์เน็ต' : 'บันทึกภาพลงแบบสำรวจแล้ว')
      } else if (analyzeOCR) {
        await runOCR(photo)
      } else {
        await savePhoto(photo, 'บันทึกภาพลงแบบสำรวจแล้ว')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ไม่สามารถประมวลผลภาพได้')
      setState('preview')
    }
  }

  const retryOCR = () => { if (preparedPhoto) void runOCR({ ...preparedPhoto, ocrStatus: 'processing' }) }
  const saveResult = () => {
    if (!preparedPhoto || !ocrResult) return
    void savePhoto({ ...preparedPhoto, ocrStatus: 'completed', ocrResult }, 'บันทึกข้อมูล OCR ลงแบบสำรวจแล้ว')
  }
  const saveAfterError = () => { if (preparedPhoto) void savePhoto({ ...preparedPhoto, ocrStatus: 'failed', ocrResult: null }, 'บันทึกภาพแล้ว สามารถวิเคราะห์ OCR ภายหลังได้') }

  const selectPropertyType = (propertyType: ListingPropertyType) => {
    if (!preparedPhoto) return
    const initial = createEmptyListingInput({
      propertyType,
      propertyId,
      surveyId,
      photoId: preparedPhoto.id,
      photoCategory: preparedPhoto.metadata.category,
      latitude: preparedPhoto.metadata.latitude,
      longitude: preparedPhoto.metadata.longitude,
      ocrResult: preparedPhoto.ocrResult,
    })
    try {
      const raw = window.localStorage.getItem(listingDraftKey)
      const previous = raw ? JSON.parse(raw) as ListingDraftInput : null
      const next = previous?.surveyId === surveyId ? { ...previous, propertyType } : initial
      window.localStorage.setItem(listingDraftKey, JSON.stringify(next))
      setListingInitial(next)
    } catch {
      setListingInitial(initial)
    }
    setState('listing-form')
  }

  const saveListing = async (listing: PropertyListingData) => {
    const surveyKey = `fieldmate-survey-draft:${propertyId}`
    try {
      await Promise.all(listing.photoIds.map((photoId) => photoStorageService.updatePropertyType(photoId, listing.propertyType)))
      const raw = window.localStorage.getItem(surveyKey)
      if (!raw) throw new Error('ไม่พบแบบสำรวจปัจจุบัน')
      const survey = JSON.parse(raw) as PropertySurvey
      if (survey.id !== surveyId) throw new Error('แบบสำรวจปัจจุบันไม่ตรงกัน')
      const linkedPhotoIds = new Set(listing.photoIds)
      const photos = survey.photos.map((photo) => linkedPhotoIds.has(photo.id) ? { ...photo, propertyType: listing.propertyType } : photo)
      window.localStorage.setItem(surveyKey, JSON.stringify({ ...survey, listing, photos, updatedAt: listing.updatedAt }))
      window.dispatchEvent(new CustomEvent('fieldmate:property-listing-saved', { detail: { propertyId, surveyId, photoIds: listing.photoIds } }))
      setSavedListing(listing)
      setState('listing-saved')
      return true
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลประกาศขายได้')
      return false
    }
  }

  const maskedPhone = savedListing?.phone
    ? `${savedListing.phone.slice(0, 3)}-XXX-${savedListing.phone.slice(-4)}`
    : '-'

  return (
    <Layout title="กล้อง AI" immersive hideAssistant hideBottomNavigation>
      <div className="survey-ai-camera-page">
        <input ref={inputRef} type="file" accept="image/*" className="cam-hidden-input" onChange={selectFile} />
        {!['property-type', 'listing-form', 'listing-saved'].includes(state) ? <header className="survey-ai-header"><button type="button" aria-label="ย้อนกลับ" onClick={() => state === 'camera' ? navigate(returnPath) : resetCapture()}><span className="material-symbols-rounded">arrow_back</span></button><div><strong>กล้อง AI</strong><small>{propertyId}</small></div><span className={permission === 'granted' ? 'ready' : ''}>{permission === 'granted' ? 'กล้องพร้อม' : 'รอกล้อง'}</span></header> : null}
        {offline && !['property-type', 'listing-form', 'listing-saved'].includes(state) ? <div className="survey-ai-offline"><span className="material-symbols-rounded">cloud_off</span>ออฟไลน์ · รูปจะบันทึกในเครื่อง</div> : null}

        {state === 'camera' ? <>
          <CameraPreview videoRef={videoRef} active={permission === 'granted'} flashActive={flashActive} />
          <div className="survey-ai-category"><span>ประเภทรูป</span><div>{categories.map((item) => <button type="button" key={item.id} className={category === item.id ? 'active' : ''} onClick={() => { setCategory(item.id); setAnalyzeOCR(item.id === 'sign') }}>{item.label}</button>)}</div><label><input type="checkbox" checked={analyzeOCR} onChange={(event) => setAnalyzeOCR(event.target.checked)} /> วิเคราะห์ OCR {category === 'sign' ? '· แนะนำสำหรับป้ายประกาศ' : ''}</label></div>
          {permission !== 'granted' && !loading ? <CameraPermission permission={permission} error={cameraError} onRetry={() => void requestCamera('environment')} onGallery={() => inputRef.current?.click()} /> : null}
          <CameraControls onGallery={() => inputRef.current?.click()} onCapture={() => void takePhoto()} onSwitch={() => void switchCamera()} onFlash={() => void toggleTorch()} flashEnabled={torchEnabled} flashAvailable={torchAvailable} disabled={permission !== 'granted'} />
        </> : null}

        {state === 'preview' && previewUrl ? <div className="survey-ai-workspace"><PhotoPreview image={previewUrl} onRetake={resetCapture} onUse={() => void usePhoto()} /><ImageQualityCheck quality={quality} onRetake={resetCapture} onUse={() => void usePhoto()} /></div> : null}
        {state === 'processing' ? <OCRProcessing stage={stage} /> : null}
        {state === 'result' && ocrResult ? <div className="survey-ai-workspace"><OCRResult result={ocrResult} onChange={setOcrResult} onRetake={resetCapture} onSave={saveResult} /></div> : null}
        {state === 'ocr-error' ? <section className="survey-ai-error"><span className="material-symbols-rounded">scan_delete</span><h1>ไม่สามารถอ่านข้อมูลจากภาพได้</h1><p>คุณยังสามารถบันทึกรูปนี้ลงแบบสำรวจและวิเคราะห์ภายหลังได้</p><div><button type="button" onClick={retryOCR}>ลองใหม่</button><button type="button" onClick={resetCapture}>ถ่ายภาพใหม่</button><button type="button" className="primary" onClick={saveAfterError}>ใช้รูปนี้ต่อ</button></div></section> : null}
        {state === 'property-type' ? <PropertyTypeSelector onSelect={selectPropertyType} onBack={() => navigate(returnPath)} /> : null}
        {state === 'listing-form' && listingInitial ? <PropertyListingForm initialValue={listingInitial} draftKey={listingDraftKey} onBack={() => setState('property-type')} onCancel={() => navigate(returnPath)} onSave={saveListing} /> : null}
        {state === 'listing-saved' && savedListing ? <section className="listing-saved-page"><span className="material-symbols-rounded">check_circle</span><h1>บันทึกข้อมูลประกาศขายแล้ว</h1><div><p><span>ประเภททรัพย์</span><strong>{savedListing.propertyType}</strong></p><p><span>ราคาเสนอขาย</span><strong>฿{formatThaiNumber(savedListing.price, 0)}</strong></p><p><span>พื้นที่</span><strong>{savedListing.propertyType === 'ที่ดิน' ? `${formatThaiNumber(savedListing.totalLandSqWah)} ตร.ว.` : `${formatThaiNumber(savedListing.usableAreaSqm || 0)} ตร.ม.`}</strong></p><p><span>เบอร์โทรผู้ขาย</span><strong>{maskedPhone}</strong></p><p><span>จำนวนรูป</span><strong>{savedListing.photoIds.length} รูป</strong></p><p><span>บันทึกเมื่อ</span><strong>{new Date(savedListing.updatedAt).toLocaleString('th-TH')}</strong></p></div><button type="button" onClick={() => navigate(returnPath)}>กลับไปสำรวจ</button></section> : null}
        {state === 'saved' ? <section className="survey-ai-saved"><span className="material-symbols-rounded">check_circle</span><h1>บันทึกลงแบบสำรวจแล้ว</h1><p>{message}</p><button type="button" onClick={() => navigate(returnPath)}>{returnTo === 'assessment' ? 'กลับไปหน้าประเมิน' : 'กลับไปแบบสำรวจ'}</button></section> : null}
        {message && !['saved', 'property-type', 'listing-form', 'listing-saved'].includes(state) ? <div className="survey-ai-message" role="alert">{message}</div> : null}
      </div>
    </Layout>
  )
}