import React, { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import GPSStatus from '../components/survey/GPSStatus'
import SurveyChecklist from '../components/survey/SurveyChecklist'
import SurveyComplete from '../components/survey/SurveyComplete'
import SurveyNotes from '../components/survey/SurveyNotes'
import SurveyPhotoGrid from '../components/survey/SurveyPhotoGrid'
import SurveyProgress from '../components/survey/SurveyProgress'
import SurveyReview from '../components/survey/SurveyReview'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import { useLiveLocation } from '../hooks/useLiveLocation'
import { PropertySurvey, SurveyChecklistItem, SurveyLocation, SurveyNote, SurveyPhoto } from '../types'
import '../styles/survey.css'

const steps = ['GPS', 'ข้อมูลทรัพย์', 'รูปภาพ', 'หมายเหตุ', 'ตรวจสอบ'] as const
const checklistLabels: Array<{ id: SurveyChecklistItem['id']; label: string }> = [
  { id: 'front', label: 'รูปด้านหน้า' },
  { id: 'side', label: 'รูปด้านข้าง' },
  { id: 'rear', label: 'รูปด้านหลัง' },
  { id: 'road', label: 'รูปถนน' },
  { id: 'surroundings', label: 'รูปบริเวณโดยรอบ' },
  { id: 'sign', label: 'ป้ายประกาศขาย' },
  { id: 'gps', label: 'พิกัด GPS' },
  { id: 'notes', label: 'หมายเหตุ' },
]

function buildChecklist(location: SurveyLocation | null, photos: SurveyPhoto[], note: SurveyNote): SurveyChecklistItem[] {
  return checklistLabels.map((item) => ({
    ...item,
    completed: item.id === 'gps'
      ? Boolean(location?.confirmed)
      : item.id === 'notes'
        ? Boolean(note.text.trim())
        : photos.some((photo) => photo.type === item.id),
  }))
}

function createSurvey(propertyId: string): PropertySurvey {
  const now = new Date().toISOString()
  const note = { text: '', voicePlaceholder: false, updatedAt: now }
  return {
    id: `survey-${propertyId}-${Date.now()}`,
    propertyId,
    status: 'draft',
    location: null,
    photos: [],
    checklist: buildChecklist(null, [], note),
    note,
    listing: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }
}

function readDraft(key: string): PropertySurvey | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as PropertySurvey : null
  } catch {
    return null
  }
}

function distanceInMeters(from: [number, number], to: [number, number]) {
  const radians = (value: number) => value * Math.PI / 180
  const latitudeDelta = radians(to[0] - from[0])
  const longitudeDelta = radians(to[1] - from[1])
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(longitudeDelta / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export default function SurveyMode() {
  const { propertyId = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const cameraReturn = searchParams.get('cameraReturn') === '1'
  const { data: properties = [], isLoading } = usePropertiesQuery()
  const property = properties.find((item) => item.id === propertyId)
  const draftKey = `fieldmate-survey-draft:${propertyId}`
  const [draftCandidate] = useState(() => readDraft(draftKey))
  const [restorePending, setRestorePending] = useState(() => Boolean(draftCandidate && draftCandidate.status !== 'completed' && !cameraReturn))
  const [survey, setSurvey] = useState<PropertySurvey>(() => draftCandidate || createSurvey(propertyId))
  const [step, setStep] = useState(() => searchParams.get('step') === 'photos' ? 2 : 0)
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const [validationMessage, setValidationMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const { location: liveLocation, error: gpsError, requestCurrentPosition } = useLiveLocation({ highAccuracy: true, watch: true, timeoutMs: 12000 })

  const updateSurvey = (patch: Partial<PropertySurvey>) => {
    setSurvey((current) => {
      const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
      return { ...next, checklist: buildChecklist(next.location, next.photos, next.note) }
    })
  }

  useEffect(() => {
    const syncNetwork = () => setOffline(!navigator.onLine)
    window.addEventListener('online', syncNetwork)
    window.addEventListener('offline', syncNetwork)
    return () => {
      window.removeEventListener('online', syncNetwork)
      window.removeEventListener('offline', syncNetwork)
    }
  }, [])

  useEffect(() => {
    if (!liveLocation || survey.location?.confirmed) return
    updateSurvey({
      location: {
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        accuracy: liveLocation.accuracy,
        capturedAt: new Date(liveLocation.timestamp).toISOString(),
        confirmed: false,
      },
    })
  }, [liveLocation?.latitude, liveLocation?.longitude, liveLocation?.accuracy, liveLocation?.timestamp, survey.location?.confirmed])

  useEffect(() => {
    if (restorePending || survey.status === 'completed') return
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(survey))
        setSaveError('')
      } catch {
        setSaveError('พื้นที่จัดเก็บในเครื่องไม่เพียงพอ กรุณาลบรูปที่ไม่จำเป็น')
      }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [draftKey, restorePending, survey])

  const completion = useMemo(() => Math.round((survey.checklist.filter((item) => item.completed).length / survey.checklist.length) * 100), [survey.checklist])
  const distanceMeters = useMemo(() => {
    if (!property || !survey.location) return null
    return distanceInMeters([property.latitude, property.longitude], [survey.location.latitude, survey.location.longitude])
  }, [property, survey.location])

  const validateSurvey = () => {
    if (!survey.location?.confirmed) return 'กรุณายืนยันตำแหน่ง GPS'
    if (!survey.photos.some((photo) => photo.type === 'front')) return 'กรุณาถ่ายรูปด้านหน้า'
    return ''
  }

  const goNext = () => {
    setValidationMessage('')
    if (step === 0 && !survey.location?.confirmed) {
      setValidationMessage('กรุณายืนยันตำแหน่ง GPS')
      return
    }
    if (step === steps.length - 1) return
    setStep((current) => current + 1)
  }

  const openAICamera = (photoId?: string, category?: SurveyPhoto['type']) => {
    try {
      const cameraSurvey = survey.status === 'completed'
        ? { ...survey, status: 'draft' as const, completedAt: null, updatedAt: new Date().toISOString() }
        : survey
      window.localStorage.setItem(draftKey, JSON.stringify(cameraSurvey))
    } catch {
      setSaveError('ไม่สามารถเตรียมแบบสำรวจก่อนเปิดกล้องได้ กรุณาลบรูปที่ไม่จำเป็น')
      return
    }
    const params = new URLSearchParams({ propertyId, surveyId: survey.id })
    if (photoId) params.set('photoId', photoId)
    if (category) params.set('category', category)
    navigate(`/camera?${params.toString()}`)
  }

  const saveSurvey = async () => {
    const message = validateSurvey()
    if (message) { setValidationMessage(message); return }
    const savingSurvey = { ...survey, status: 'saving' as const, updatedAt: new Date().toISOString() }
    setSurvey(savingSurvey)
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    const completedSurvey: PropertySurvey = { ...savingSurvey, status: 'completed', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    setSurvey(completedSurvey)
    window.localStorage.removeItem(draftKey)
    try {
      const raw = window.localStorage.getItem('fieldmate-completed-surveys')
      const completed = raw ? JSON.parse(raw) as Record<string, PropertySurvey> : {}
      window.localStorage.setItem('fieldmate-completed-surveys', JSON.stringify({ ...completed, [propertyId]: completedSurvey }))
      window.dispatchEvent(new CustomEvent('fieldmate:survey-completed', { detail: { propertyId } }))
    } catch {
      setSaveError('บันทึกผลสำรวจแล้ว แต่ไม่สามารถอัปเดตสถานะแผนที่ในเครื่องได้')
    }
  }

  if (isLoading) {
    return <Layout title="สำรวจทรัพย์" immersive hideAssistant hideBottomNavigation><div className="survey-page" role="status">กำลังโหลดข้อมูลทรัพย์...</div></Layout>
  }

  if (!property) return <Navigate to="/map" replace />

  if (survey.status === 'completed') {
    return <Layout title="สำรวจทรัพย์" immersive hideAssistant hideBottomNavigation><SurveyComplete property={property} survey={survey} onProperty={() => navigate(`/property/${property.id}`)} onCamera={() => openAICamera()} onAssessment={() => navigate(`/assessment?propertyId=${encodeURIComponent(property.id)}&surveyId=${encodeURIComponent(survey.id)}`)} onMap={() => navigate('/map')} /></Layout>
  }

  return (
    <Layout title="สำรวจทรัพย์" immersive hideAssistant hideBottomNavigation>
      <div className="survey-page">
        <header className="survey-header">
          <div className="survey-header-top">
            <button type="button" className="survey-icon-button" aria-label="ย้อนกลับ" onClick={() => step > 0 ? setStep((current) => current - 1) : navigate('/map')}><span className="material-symbols-rounded" aria-hidden="true">arrow_back</span></button>
            <div><h1>สำรวจทรัพย์</h1><p>{property.owner} · {property.id}</p></div>
            <span className="survey-status-badge">{survey.status === 'saving' ? 'กำลังบันทึก...' : 'แบบร่าง'}</span>
          </div>
          <SurveyProgress current={step + 1} total={steps.length} percent={completion} />
        </header>

        {offline ? <div className="survey-offline"><span className="material-symbols-rounded" aria-hidden="true">cloud_off</span><span>ออฟไลน์ · ข้อมูลจะซิงค์เมื่อมีอินเทอร์เน็ต</span></div> : null}

        <div className="survey-content">
          {step === 0 ? <GPSStatus property={property} location={survey.location} distanceMeters={distanceMeters} error={gpsError} loading={!liveLocation && !gpsError} onRetry={requestCurrentPosition} onConfirm={() => survey.location && updateSurvey({ location: { ...survey.location, confirmed: true } })} /> : null}
          {step === 1 ? <section className="survey-card survey-property-hero">
            {property.images[0] ? <img className="survey-property-image" src={property.images[0]} alt={property.owner} /> : null}
            <div className="survey-card-heading compact"><div><h2>ข้อมูลทรัพย์</h2><p>ข้อมูลจากรายการทรัพย์เดิม</p></div></div>
            <div className="survey-data-list">
              <div><span>ประเภททรัพย์</span><strong>{survey.listing?.propertyType || property.type || 'ทรัพย์สิน'}</strong></div>
              <div><span>ที่อยู่</span><strong>{property.address}</strong></div>
              <div><span>จังหวัด</span><strong>{property.province}</strong></div>
              <div><span>อำเภอ</span><strong>เขตสำรวจหลัก</strong></div>
              <div><span>ตำบล</span><strong>พื้นที่สำรวจ {property.id}</strong></div>
              <div><span>ราคาประกาศ</span><strong>{(survey.listing?.price || property.marketPrice).toLocaleString('th-TH')} บาท</strong></div>
              <div><span>พื้นที่</span><strong>{survey.listing ? (survey.listing.propertyType === 'ที่ดิน' ? `${survey.listing.totalLandSqWah.toLocaleString('th-TH')} ตร.ว.` : `${(survey.listing.usableAreaSqm || 0).toLocaleString('th-TH')} ตร.ม.`) : `${property.areaSqm.toLocaleString('th-TH')} ตร.ม.`}</strong></div>
            </div>
          </section> : null}
          {step === 2 ? <>
            <button type="button" className="survey-open-ai-camera" onClick={() => openAICamera()}>
              <span className="material-symbols-rounded" aria-hidden="true">document_scanner</span>
              <span><strong>เปิดกล้อง AI</strong><small>ถ่ายภาพและอ่านข้อมูลบนป้ายด้วย OCR</small></span>
              <span className="material-symbols-rounded" aria-hidden="true">chevron_right</span>
            </button>
            <SurveyPhotoGrid propertyId={property.id} surveyId={survey.id} location={survey.location} photos={survey.photos} onChange={(photos) => updateSurvey({ photos })} onAnalyze={(photo) => openAICamera(photo.id, photo.type)} />
            <SurveyChecklist items={survey.checklist} />
          </> : null}
          {step === 3 ? <><SurveyNotes note={survey.note} onChange={(note) => updateSurvey({ note })} /><SurveyChecklist items={survey.checklist} /></> : null}
          {step === 4 ? <SurveyReview property={property} survey={survey} completion={completion} /> : null}
          {validationMessage ? <div className="survey-inline-error" role="alert">{validationMessage}</div> : null}
          {saveError ? <div className="survey-inline-error" role="alert">{saveError}</div> : null}
        </div>

        <nav className="survey-bottom-bar" aria-label="ขั้นตอนแบบสำรวจ">
          <button type="button" onClick={() => step > 0 ? setStep((current) => current - 1) : navigate('/map')}>{step > 0 ? 'ย้อนกลับ' : 'กลับแผนที่'}</button>
          {step < steps.length - 1
            ? <button type="button" className="primary" onClick={goNext}>ถัดไป · {steps[step + 1]}</button>
            : <button type="button" className="primary" disabled={survey.status === 'saving'} onClick={() => void saveSurvey()}>{survey.status === 'saving' ? 'กำลังบันทึก...' : 'บันทึกการสำรวจ'}</button>}
        </nav>

        {restorePending ? <div className="survey-restore-sheet" role="dialog" aria-modal="true" aria-label="แบบสำรวจที่ยังไม่เสร็จ">
          <div><h2>มีแบบสำรวจที่ยังไม่เสร็จ</h2><p>พบแบบร่างของทรัพย์ {property.id} ที่บันทึกไว้ในเครื่อง</p><div className="survey-restore-actions"><button type="button" className="survey-button secondary" onClick={() => { setSurvey(createSurvey(propertyId)); setRestorePending(false); window.localStorage.removeItem(draftKey) }}>เริ่มใหม่</button><button type="button" className="survey-button primary" onClick={() => setRestorePending(false)}>ทำต่อ</button></div></div>
        </div> : null}
      </div>
    </Layout>
  )
}