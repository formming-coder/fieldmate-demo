import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../Layout'
import { usePropertiesQuery } from '../../hooks/useBackendQueries'
import { Assessment, AssessmentOverride, AssessmentStatus, ComparableProperty, OCRResult, Property, PropertySurvey, SurveyPhoto } from '../../types'
import { comparableService, ComparableFilters } from '../../services/assessment/comparableService'
import { aiAssessmentService } from '../../services/assessment/aiAssessmentService'
import { marketAnalysisService } from '../../services/assessment/marketAnalysisService'
import { riskAnalysisService } from '../../services/assessment/riskAnalysisService'
import { assessmentService } from '../../services/assessment/assessmentService'
import AssessmentHeader from './AssessmentHeader'
import PropertySummary from './PropertySummary'
import PhotoAnalysis from './PhotoAnalysis'
import OCRSummary from './OCRSummary'
import ComparableList from './ComparableList'
import ComparableDetail from './ComparableDetail'
import ComparableSelector from './ComparableSelector'
import AIResultCard from './AIResultCard'
import ConfidenceScore from './ConfidenceScore'
import MarketAnalysis from './MarketAnalysis'
import RiskAnalysis from './RiskAnalysis'
import AIRecommendation from './AIRecommendation'
import AssessmentReview from './AssessmentReview'
import AssessmentDisclaimer from './AssessmentDisclaimer'
import '../../styles/assessment.css'

const defaultFilters: ComparableFilters = { type: '', maxDistanceKm: 20, minArea: 0, maxArea: 1000, minPrice: 0, maxPrice: 100000000, maxAgeYears: 30, status: '' }
const statusLabel: Record<AssessmentStatus, string> = { 'not-started': 'ยังไม่เริ่ม', analyzing: 'กำลังวิเคราะห์', analyzed: 'วิเคราะห์แล้ว', 'pending-review': 'รอตรวจสอบ', edited: 'แก้ไขแล้ว', completed: 'เสร็จสิ้น' }

function readSurvey(property: Property, requestedSurveyId: string) {
  try {
    const draftRaw = localStorage.getItem(`fieldmate-survey-draft:${property.id}`)
    const draft = draftRaw ? JSON.parse(draftRaw) as PropertySurvey : null
    if (draft && (!requestedSurveyId || draft.id === requestedSurveyId)) return draft
    const completedRaw = localStorage.getItem('fieldmate-completed-surveys')
    const completed = completedRaw ? JSON.parse(completedRaw) as Record<string, PropertySurvey> : {}
    if (completed[property.id] && (!requestedSurveyId || completed[property.id].id === requestedSurveyId)) return completed[property.id]
  } catch { return null }
  return null
}

export default function AIAssessment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedPropertyId = searchParams.get('propertyId') || ''
  const requestedSurveyId = searchParams.get('surveyId') || ''
  const { data: properties = [], isLoading } = usePropertiesQuery()
  const property = requestedPropertyId ? properties.find((item) => item.id === requestedPropertyId) : undefined
  const survey = useMemo(() => property ? readSurvey(property, requestedSurveyId) : null, [property, requestedSurveyId])
  const comparablePool = useMemo(() => property ? comparableService.findNearby(property, properties) : [], [property, properties])
  const [filters, setFilters] = useState(defaultFilters)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detail, setDetail] = useState<ComparableProperty | null>(null)
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [override, setOverride] = useState<AssessmentOverride>({ value: null, note: '', changed: false })
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<AssessmentStatus>('analyzing')
  const [reviewMode, setReviewMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const restoredKeyRef = useRef('')

  useEffect(() => { if (comparablePool.length && !selectedIds.length) setSelectedIds(comparablePool.slice(0, 4).map((item) => item.id)) }, [comparablePool, selectedIds.length])
  useEffect(() => { if (!survey) return; setOcrResults(survey.photos.map((photo) => photo.ocrResult).filter((result): result is OCRResult => Boolean(result))); const timer = window.setTimeout(() => setStatus('analyzed'), 650); return () => window.clearTimeout(timer) }, [survey?.id])
  useEffect(() => { const sync = () => setOffline(!navigator.onLine); window.addEventListener('online', sync); window.addEventListener('offline', sync); return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync) } }, [])

  const selectedComparables = useMemo(() => selectedIds.map((id) => comparablePool.find((item) => item.id === id)).filter((item): item is ComparableProperty => Boolean(item)).map((item) => ({ ...item, selected: true })), [comparablePool, selectedIds])
  const displayPool = useMemo(() => comparablePool.map((item) => ({ ...item, selected: selectedIds.includes(item.id) })), [comparablePool, selectedIds])
  const filteredComparables = useMemo(() => comparableService.filter(displayPool, filters), [displayPool, filters])
  const market = useMemo(() => marketAnalysisService.analyze(selectedComparables), [selectedComparables])
  const analysisResult = useMemo(() => property && survey ? aiAssessmentService.analyze({ property, survey, comparables: selectedComparables }) : null, [property, survey, selectedComparables, ocrResults])
  const risks = useMemo(() => property && survey ? riskAnalysisService.analyze(property, survey, market.averageListingPrice) : null, [property, survey, market.averageListingPrice, ocrResults])
  const assessment = useMemo<Assessment | null>(() => property && survey && analysisResult && risks ? { id: `assessment-${property.id}-${survey.id}`, propertyId: property.id, surveyId: survey.id, status, propertyData: property, photos: survey.photos, ocrResults, comparables: selectedComparables, aiAnalysis: analysisResult.analysis, marketAnalysis: market, riskAnalysis: risks, confidence: analysisResult.confidence, override, note, timestamp: new Date().toISOString(), gps: survey.location, exportPreparation: { pdfReady: false, excelReady: false, reportVersion: 1 } } : null, [property, survey, analysisResult, risks, status, ocrResults, selectedComparables, market, override, note])

  useEffect(() => { if (!assessment || restoredKeyRef.current === assessment.id) return; restoredKeyRef.current = assessment.id; const draft = assessmentService.readDraft(assessment.propertyId, assessment.surveyId); if (!draft) return; setSelectedIds(draft.comparables.map((item) => item.id)); setOcrResults(draft.ocrResults); setOverride(draft.override); setNote(draft.note); setStatus(draft.status === 'completed' ? 'analyzed' : draft.status) }, [assessment?.id])
  useEffect(() => { if (!assessment || assessment.status === 'completed') return; const timer = window.setTimeout(() => { try { assessmentService.saveDraft(assessment) } catch { setMessage('ไม่สามารถบันทึกแบบร่างในเครื่องได้') } }, 450); return () => window.clearTimeout(timer) }, [assessment])

  if (isLoading) return <Layout title="AI ประเมินทรัพย์" immersive hideAssistant hideBottomNavigation><div className="aa-loading">กำลังเตรียมข้อมูลประเมิน...</div></Layout>
  if (!property || !survey || !assessment || !analysisResult || !risks) return <Layout title="AI ประเมินทรัพย์" immersive hideAssistant hideBottomNavigation><div className="aa-loading">ไม่พบข้อมูลทรัพย์สำหรับประเมิน <button type="button" onClick={() => navigate('/map')}>กลับแผนที่</button></div></Layout>

  const toggleComparable = (item: ComparableProperty) => { setMessage(''); if (selectedIds.includes(item.id)) { if (selectedIds.length <= 3) { setMessage('ต้องเลือกทรัพย์เปรียบเทียบอย่างน้อย 3 รายการ'); return } setSelectedIds((current) => current.filter((id) => id !== item.id)) } else { if (selectedIds.length >= 10) { setMessage('เลือกทรัพย์เปรียบเทียบได้สูงสุด 10 รายการ'); return } setSelectedIds((current) => [...current, item.id]) } setDetail(null) }
  const moveComparable = (id: string, direction: -1 | 1) => setSelectedIds((current) => { const index = current.indexOf(id); const target = index + direction; if (index < 0 || target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next })
  const openCamera = (photo?: SurveyPhoto) => { try { localStorage.setItem(`fieldmate-survey-draft:${property.id}`, JSON.stringify({ ...survey, status: 'draft' })) } catch { setMessage('ไม่สามารถเตรียมข้อมูลรูปภาพได้'); return } const params = new URLSearchParams({ propertyId: property.id, surveyId: survey.id, returnTo: 'assessment' }); if (photo) { params.set('photoId', photo.id); params.set('category', photo.type) } navigate(`/camera?${params.toString()}`) }
  const updateOverrideValue = (value: number | null) => { const changed = Boolean(value && value !== assessment.aiAnalysis.result.estimatedValue); setOverride((current) => ({ ...current, value, changed })); setStatus(changed ? 'edited' : 'analyzed') }
  const openReview = () => { if (selectedComparables.length < 3) { setMessage('กรุณาเลือกทรัพย์เปรียบเทียบอย่างน้อย 3 รายการ'); return } if (override.changed && !override.note.trim()) { setMessage('กรุณาระบุเหตุผลที่ปรับราคา'); return } setStatus('pending-review'); setReviewMode(true); setMessage('') }
  const saveAssessment = () => { const completed = { ...assessment, status: 'completed' as const, timestamp: new Date().toISOString() }; try { assessmentService.save(completed); assessmentService.prepareExport(completed); setStatus('completed'); setSaved(true); setReviewMode(false) } catch { setMessage('ไม่สามารถบันทึกผลวิเคราะห์ในเครื่องได้') } }

  return <Layout title="AI ประเมินทรัพย์" immersive hideAssistant hideBottomNavigation><div className="aa-page"><AssessmentHeader propertyId={property.id} type={property.type || 'ทรัพย์สิน'} location={property.province} surveyDate={new Date(survey.completedAt || survey.updatedAt).toLocaleDateString('th-TH')} status={statusLabel[status]} offline={offline} onBack={() => navigate(`/survey/${property.id}`)} /><main className="aa-content">{reviewMode ? <AssessmentReview assessment={assessment} /> : <><PropertySummary property={property} survey={survey} /><PhotoAnalysis photos={survey.photos} onAdd={() => openCamera()} onRetake={openCamera} /><OCRSummary results={ocrResults} onChange={(results) => { setOcrResults(results); setStatus('edited') }} /><ComparableList items={filteredComparables} filters={filters} onFilters={setFilters} onOpen={setDetail} /><ComparableSelector items={selectedComparables} onRemove={(id) => { const item = displayPool.find((candidate) => candidate.id === id); if (item) toggleComparable(item) }} onMove={moveComparable} /><AIResultCard analysis={assessment.aiAnalysis} /><ConfidenceScore confidence={assessment.confidence} /><MarketAnalysis analysis={assessment.marketAnalysis} /><RiskAnalysis analysis={assessment.riskAnalysis} /><AIRecommendation recommendation={assessment.aiAnalysis.recommendation} /><section className="as-card aa-override"><h2>ราคาที่ผู้ประเมินเห็นสมควร</h2><input type="number" inputMode="numeric" placeholder={assessment.aiAnalysis.result.estimatedValue.toString()} value={override.value || ''} onChange={(event) => updateOverrideValue(event.target.value ? Number(event.target.value) : null)} />{override.changed ? <textarea rows={3} value={override.note} onChange={(event) => setOverride((current) => ({ ...current, note: event.target.value }))} placeholder="ปรับราคาเนื่องจากสภาพทรัพย์ดีกว่าทรัพย์เปรียบเทียบ" /> : null}<label>หมายเหตุเพิ่มเติม<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="เพิ่มหมายเหตุสำหรับผู้ตรวจสอบ" /></label></section></>}<AssessmentDisclaimer />{message ? <div className="aa-message" role="alert">{message}</div> : null}{saved ? <section className="as-card aa-saved"><span className="material-symbols-rounded">check_circle</span><h2>บันทึกผลวิเคราะห์เรียบร้อย</h2><p>{offline ? 'บันทึกในเครื่องแล้ว และจะซิงค์เมื่อมีอินเทอร์เน็ต' : 'ข้อมูลพร้อมสำหรับการตรวจสอบและจัดทำรายงาน'}</p><div><button type="button" onClick={() => navigate(`/property/${property.id}`)}>ดูข้อมูลทรัพย์</button><button type="button" onClick={() => navigate('/map')}>กลับแผนที่</button></div></section> : null}</main>{!saved ? <nav className="aa-bottom-bar"><button type="button" onClick={() => reviewMode ? (setReviewMode(false), setStatus(override.changed ? 'edited' : 'analyzed')) : navigate(`/survey/${property.id}`)}>{reviewMode ? 'กลับไปแก้ไข' : 'กลับแบบสำรวจ'}</button><button type="button" className="primary" onClick={reviewMode ? saveAssessment : openReview}>{reviewMode ? 'บันทึกผลวิเคราะห์' : 'ตรวจสอบและบันทึก'}</button></nav> : null}<ComparableDetail item={detail} onClose={() => setDetail(null)} onToggle={toggleComparable} /></div></Layout>
}