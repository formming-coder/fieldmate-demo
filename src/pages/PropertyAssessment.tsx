import { formatThaiCurrency, formatThaiDate } from '../lib/locale'
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCreateAssessmentMutation } from '../hooks/useBackendQueries'
import { useAutoSaveDraft } from '../hooks/useAutoSaveDraft'
import AssessmentHeader from '../components/assessment/AssessmentHeader'
import ConfidenceCard from '../components/assessment/ConfidenceCard'
import PropertyOverview from '../components/assessment/PropertyOverview'
import ImageAnalysis from '../components/assessment/ImageAnalysis'
import RiskAssessment from '../components/assessment/RiskAssessment'
import LocationAnalysis from '../components/assessment/LocationAnalysis'
import ComparableCarousel from '../components/assessment/ComparableCarousel'
import MarketAnalysis from '../components/assessment/MarketAnalysis'
import PriceRecommendation from '../components/assessment/PriceRecommendation'
import ConditionChecklist from '../components/assessment/ConditionChecklist'
import InspectionNotes from '../components/assessment/InspectionNotes'
import AIRecommendation from '../components/assessment/AIRecommendation'
import AssessmentScore from '../components/assessment/AssessmentScore'
import '../styles/assessment.css'

const AssessmentGallery = lazy(() => import('../components/assessment/AssessmentGallery'))
const ReportPreview = lazy(() => import('../components/assessment/ReportPreview'))
const ExportActions = lazy(() => import('../components/assessment/ExportActions'))

const OFFLINE_QUEUE_KEY = 'fieldmate:assessment:queue'
const DRAFT_KEY = 'fieldmate:assessment:draft:v4'

type ChecklistItem = {
  key: string
  checked: boolean
}

function readQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return raw ? (JSON.parse(raw) as Array<{ id: string; createdAt: string }>) : []
  } catch {
    return []
  }
}

function writeQueue(items: Array<{ id: string; createdAt: string }>) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export default function PropertyAssessment() {
  const navigate = useNavigate()
  const createAssessmentMutation = useCreateAssessmentMutation()
  const [confidence] = useState(84)
  const [score, setScore] = useState(82)
  const [note, setNote] = useState('')
  const [reportMode, setReportMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAllComparables, setShowAllComparables] = useState(false)
  const [syncState, setSyncState] = useState<'synced' | 'queued' | 'conflict'>('synced')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { key: 'ฐานราก', checked: true },
    { key: 'หลังคา', checked: true },
    { key: 'ผนัง', checked: true },
    { key: 'เพดาน', checked: true },
    { key: 'พื้น', checked: true },
    { key: 'ระบบไฟฟ้า', checked: false },
    { key: 'ระบบน้ำ', checked: true },
    { key: 'โครงสร้าง', checked: true },
    { key: 'สภาพแวดล้อม', checked: false },
  ])

  const { readDraft, clearDraft, lastSavedAt } = useAutoSaveDraft({
    key: DRAFT_KEY,
    value: { note, score, checklist, reportMode, showAllComparables },
    intervalMs: 5000,
    enabled: true,
  })

  useEffect(() => {
    const draft = readDraft()
    if (!draft) return

    const typedDraft = draft as {
      note?: string
      score?: number
      checklist?: ChecklistItem[]
      reportMode?: boolean
      showAllComparables?: boolean
    }

    if (typeof typedDraft.note === 'string') setNote(typedDraft.note)
    if (typeof typedDraft.score === 'number') setScore(typedDraft.score)
    if (Array.isArray(typedDraft.checklist)) setChecklist(typedDraft.checklist)
    if (typeof typedDraft.reportMode === 'boolean') setReportMode(typedDraft.reportMode)
    if (typeof typedDraft.showAllComparables === 'boolean') setShowAllComparables(typedDraft.showAllComparables)
  }, [])

  const checkedCount = checklist.filter((item) => item.checked).length

  const detections = useMemo(
    () => [
      { id: 'd1', label: 'หลังคา', confidence: 0.88 },
      { id: 'd2', label: 'สีผนัง', confidence: 0.78 },
      { id: 'd3', label: 'หน้าต่าง', confidence: 0.92 },
      { id: 'd4', label: 'ทางเข้าออก', confidence: 0.81 },
      { id: 'd5', label: 'ที่จอดรถ', confidence: 0.74 },
      { id: 'd6', label: 'คุณภาพงานก่อสร้าง', confidence: 0.86 },
    ],
    []
  )

  const recommendationValue = 7680000
  const comparableItems = [
    { id: 'cmp-1', title: 'บ้านเดี่ยว สุขุมวิท 62', similarity: 91, distanceKm: 1.2, price: 7850000, pricePerSqm: 35600 },
    { id: 'cmp-2', title: 'ทาวน์โฮม บางนา 3 ห้องนอน', similarity: 84, distanceKm: 2.3, price: 6980000, pricePerSqm: 31800 },
    { id: 'cmp-3', title: 'ที่ดินเปล่า อ่อนนุช', similarity: 79, distanceKm: 3.1, price: 7320000, pricePerSqm: 34100 },
    { id: 'cmp-4', title: 'บ้านแฝด พระราม 4', similarity: 87, distanceKm: 2.8, price: 8040000, pricePerSqm: 36500 },
  ]

  const saveAssessment = async () => {
    const payloadId = `asm-${Date.now()}`

    if (!navigator.onLine) {
      const queue = readQueue()
      const next = [{ id: payloadId, createdAt: new Date().toISOString() }, ...queue]
      writeQueue(next)
      setSyncState(next.length > 4 ? 'conflict' : 'queued')
      setSaved(true)
      return
    }

    await createAssessmentMutation.mutateAsync({
      id: payloadId,
      propertyId: 'PROP-BKK-2208',
      recommendation: recommendationValue,
      score: Math.round((score + checkedCount * 2.3) / 1.2),
      note,
      checklist,
    })

    setSyncState('synced')
    setSaved(true)
    clearDraft()
  }

  return (
    <Layout title="ประเมิน AI" immersive hideAssistant>
      <motion.div className="as-page" initial={{ opacity: 0, y: 10, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
        <AssessmentHeader
          propertyId="PROP-BKK-2208"
          owner="สมชาย ประดิษฐ์"
          inspectionDate={new Date().toLocaleDateString('th-TH')}
          assessor="นีนา รัตนกุล"
          gps="13.736717, 100.523186"
          weather="เมฆมาก 31 องศา"
          aiStatus="AI กำลังวิเคราะห์"
        />

        <ConfidenceCard confidence={confidence} />

        <div className="as-card" style={{ fontSize: 12, color: '#74644c' }}>
          บันทึกอัตโนมัติทุก 5 วินาที{lastSavedAt ? ` • ล่าสุด ${formatThaiDate(new Date(lastSavedAt))} ${new Date(lastSavedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </div>

        <PropertyOverview
          type="บ้านเดี่ยว"
          buildingSize="220 ตร.ม."
          landArea="1 ไร่ 72 ตร.ว."
          floor="2 ชั้น"
          age="8 ปี"
          condition="ดี"
          occupancy="เจ้าของอยู่อาศัย"
        />

        <ImageAnalysis
          image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=960&q=80"
          detections={detections}
        />

        <RiskAssessment
          items={[
            { key: 'ความเสี่ยงน้ำท่วม', score: 28 },
            { key: 'พื้นที่ป่า', score: 17 },
            { key: 'ความลาดชัน', score: 32 },
            { key: 'ถนนทางเข้าออก', score: 41 },
            { key: 'ความเสี่ยงทางกฎหมาย', score: 36 },
            { key: 'ความเสี่ยงสิ่งแวดล้อม', score: 26 },
            { key: 'โครงสร้างพื้นฐาน', score: 22 },
            { key: 'งานก่อสร้างใกล้เคียง', score: 49 },
            { key: 'การจราจรและเสียงรบกวน', score: 56 },
          ]}
        />

        <LocationAnalysis
          province="กรุงเทพมหานคร"
          district="พระโขนง"
          subdistrict="บางจาก"
          gps="13.736717, 100.523186"
          distances={[
            { label: 'ถนนหลัก', distance: '0.4 กม.' },
            { label: 'โรงพยาบาล', distance: '1.3 กม.' },
            { label: 'โรงเรียน', distance: '1.0 กม.' },
            { label: 'รถไฟฟ้า', distance: '0.8 กม.' },
            { label: 'รถไฟใต้ดิน', distance: '2.6 กม.' },
            { label: 'ทางด่วน', distance: '1.9 กม.' },
            { label: 'ศูนย์การค้า', distance: '2.1 กม.' },
            { label: 'หน่วยงานรัฐ', distance: '2.9 กม.' },
          ]}
        />

        <ComparableCarousel
          items={showAllComparables ? comparableItems : comparableItems.slice(0, 2)}
          onCompare={() => setScore((current) => Math.min(94, current + 1))}
        />
        <button type="button" className="as-open-report" onClick={() => setShowAllComparables((current) => !current)}>
          {showAllComparables ? 'ย่อรายการทรัพย์เปรียบเทียบ' : 'ขยายรายการทรัพย์เปรียบเทียบ'}
        </button>

        <MarketAnalysis average={7420000} median={7260000} growth={4.8} demand={73} supply={52} />

        <PriceRecommendation
          recommended={recommendationValue}
          min={7190000}
          max={8020000}
          suggested={7520000}
          confidence={confidence}
          reasoning="ราคาที่แนะนำคำนวณจากคุณภาพทางเข้าออก ข้อมูลซื้อขายใกล้เคียงล่าสุด และสภาพอาคารที่ตรวจพบจากภาพภายนอกและภายใน"
        />

        <ConditionChecklist
          items={checklist}
          onToggle={(key) => {
            setChecklist((current) => current.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item)))
          }}
        />

        <Suspense fallback={<div className="as-card as-loading">กำลังโหลดแกลเลอรี...</div>}>
          <AssessmentGallery
            images={[
              { id: 'g-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=960&q=80', category: 'ภายนอก' },
              { id: 'g-2', url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=960&q=80', category: 'ภายนอก' },
              { id: 'g-3', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=960&q=80', category: 'ภายใน' },
              { id: 'g-4', url: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=960&q=80', category: 'ถนน' },
              { id: 'g-5', url: 'https://images.unsplash.com/photo-1628744404730-5f7f4553c0dc?auto=format&fit=crop&w=960&q=80', category: 'เอกสาร' },
              { id: 'g-6', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=960&q=80', category: 'ที่ดิน' },
            ]}
          />
        </Suspense>

        <InspectionNotes
          transcript="โครงสร้างหลักอยู่ในสภาพมั่นคง ผนังด้านหลังบางส่วนควรปรับปรุงสี และควรตรวจสอบข้อมูลเอกสารสิทธิ์เพิ่มเติม"
          note={note}
          onNoteChange={setNote}
          onInsert={(text) => setNote((current) => `${current}${current ? '\n' : ''}${text}`)}
        />

        <AIRecommendation
          items={[
            'ควรถ่ายแผงไฟฟ้าเพิ่มเติมเพื่อยืนยันรายละเอียด',
            'ควรตรวจเอกสารแนบการโอนกรรมสิทธิ์เพิ่มเติม',
            'ควรถ่ายแนวรั้วด้านหลังเพิ่มอีกอย่างน้อย 1 ภาพ',
            'ควรยืนยันข้อมูลตลาดด้วยทรัพย์เปรียบเทียบเพิ่มเติม',
            'ควรให้ผู้ประเมินอาวุโสทบทวนก่อนสรุปผล',
          ]}
        />

        <AssessmentScore score={Math.round((score + checkedCount * 2.3) / 1.2)} />

        {!reportMode ? (
          <button type="button" className="as-open-report" onClick={() => setReportMode(true)}>
            สร้างรายงานการประเมิน
          </button>
        ) : null}

        {reportMode ? (
          <Suspense fallback={<div className="as-card as-loading">กำลังเตรียมตัวอย่างรายงาน...</div>}>
            <ReportPreview
              propertyId="PROP-BKK-2208"
              owner="สมชาย ประดิษฐ์"
              recommendation={recommendationValue}
              score={Math.round((score + checkedCount * 2.3) / 1.2)}
              reasoning="AI ใช้คุณภาพภาพ ความโดดเด่นของทำเล การปรับความเสี่ยง และพฤติกรรมราคาทรัพย์เปรียบเทียบใกล้เคียงในการสรุปราคาแนะนำ"
            />
            <ExportActions
              onPdf={() => setSaved(false)}
              onExcel={() => setSaved(false)}
              onShare={() => setSaved(false)}
              onEmail={() => setSaved(false)}
              onSave={saveAssessment}
            />
          </Suspense>
        ) : null}

        {saved ? (
          <section className="as-card as-sync-state">
            <h2>สถานะการซิงก์</h2>
            <p>
              {syncState === 'synced' ? 'บันทึกและซิงก์ขึ้นคลาวด์เรียบร้อยแล้ว' : null}
              {syncState === 'queued' ? 'บันทึกในเครื่องแล้ว และจะซิงก์เมื่อเครือข่ายกลับมา' : null}
              {syncState === 'conflict' ? 'พบความเสี่ยงข้อมูลซิงก์ขัดแย้ง ควรให้ผู้เชี่ยวชาญตรวจทานก่อนรวมข้อมูล' : null}
            </p>
            <div className="as-sync-actions">
              <button type="button" onClick={() => navigate('/home')}>กลับหน้าหลัก</button>
              <button type="button" onClick={() => navigate('/map')}>เปิดแผนที่อัจฉริยะ</button>
              <button type="button" onClick={() => navigate('/shared-intelligence')}>เปิดข้อมูลส่วนกลาง</button>
            </div>
          </section>
        ) : null}
      </motion.div>
    </Layout>
  )
}
