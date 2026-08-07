import React, { Suspense, lazy, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useCreateAssessmentMutation } from '../hooks/useBackendQueries'
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
    { key: 'Foundation', checked: true },
    { key: 'Roof', checked: true },
    { key: 'Wall', checked: true },
    { key: 'Ceiling', checked: true },
    { key: 'Floor', checked: true },
    { key: 'Electrical', checked: false },
    { key: 'Water', checked: true },
    { key: 'Structure', checked: true },
    { key: 'Environment', checked: false },
  ])

  const checkedCount = checklist.filter((item) => item.checked).length

  const detections = useMemo(
    () => [
      { id: 'd1', label: 'Roof', confidence: 0.88 },
      { id: 'd2', label: 'Wall Paint', confidence: 0.78 },
      { id: 'd3', label: 'Window', confidence: 0.92 },
      { id: 'd4', label: 'Road Access', confidence: 0.81 },
      { id: 'd5', label: 'Parking', confidence: 0.74 },
      { id: 'd6', label: 'Construction Quality', confidence: 0.86 },
    ],
    []
  )

  const recommendationValue = 7680000
  const comparableItems = [
    { id: 'cmp-1', title: 'Sukhumvit 62 Detached', similarity: 91, distanceKm: 1.2, price: 7850000, pricePerSqm: 35600 },
    { id: 'cmp-2', title: 'Bangna Townhome 3BR', similarity: 84, distanceKm: 2.3, price: 6980000, pricePerSqm: 31800 },
    { id: 'cmp-3', title: 'Onnut Residential Lot', similarity: 79, distanceKm: 3.1, price: 7320000, pricePerSqm: 34100 },
    { id: 'cmp-4', title: 'Rama 4 Semi Detached', similarity: 87, distanceKm: 2.8, price: 8040000, pricePerSqm: 36500 },
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
  }

  return (
    <Layout title="AI Property Assessment" immersive hideAssistant>
      <motion.div className="as-page" initial={{ opacity: 0, y: 10, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
        <AssessmentHeader
          propertyId="PROP-BKK-2208"
          owner="Somchai Pradit"
          inspectionDate={new Date().toLocaleDateString('th-TH')}
          assessor="Nina Rattanakul"
          gps="13.736717, 100.523186"
          weather="Cloudy 31C"
          aiStatus="AI Analyzing"
        />

        <ConfidenceCard confidence={confidence} />

        <PropertyOverview
          type="House"
          buildingSize="220 sqm"
          landArea="1 Rai 72 Sq.wah"
          floor="2 floors"
          age="8 years"
          condition="Good"
          occupancy="Owner occupied"
        />

        <ImageAnalysis
          image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=960&q=80"
          detections={detections}
        />

        <RiskAssessment
          items={[
            { key: 'Flood Risk', score: 28 },
            { key: 'Forest Area', score: 17 },
            { key: 'Slope', score: 32 },
            { key: 'Access Road', score: 41 },
            { key: 'Legal Risk', score: 36 },
            { key: 'Environmental Risk', score: 26 },
            { key: 'Infrastructure', score: 22 },
            { key: 'Nearby Construction', score: 49 },
            { key: 'Traffic/Noise', score: 56 },
          ]}
        />

        <LocationAnalysis
          province="Bangkok"
          district="Phra Khanong"
          subdistrict="Bang Chak"
          gps="13.736717, 100.523186"
          distances={[
            { label: 'Main Road', distance: '0.4 km' },
            { label: 'Hospital', distance: '1.3 km' },
            { label: 'School', distance: '1.0 km' },
            { label: 'BTS', distance: '0.8 km' },
            { label: 'MRT', distance: '2.6 km' },
            { label: 'Expressway', distance: '1.9 km' },
            { label: 'Shopping Mall', distance: '2.1 km' },
            { label: 'Gov Office', distance: '2.9 km' },
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
          reasoning="Price is weighted by road access quality, recent nearby sales, and detected building condition from exterior/interior image sets."
        />

        <ConditionChecklist
          items={checklist}
          onToggle={(key) => {
            setChecklist((current) => current.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item)))
          }}
        />

        <Suspense fallback={<div className="as-card as-loading">Loading gallery...</div>}>
          <AssessmentGallery
            images={[
              { id: 'g-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=960&q=80', category: 'Exterior' },
              { id: 'g-2', url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=960&q=80', category: 'Exterior' },
              { id: 'g-3', url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=960&q=80', category: 'Interior' },
              { id: 'g-4', url: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=960&q=80', category: 'Road' },
              { id: 'g-5', url: 'https://images.unsplash.com/photo-1628744404730-5f7f4553c0dc?auto=format&fit=crop&w=960&q=80', category: 'Document' },
              { id: 'g-6', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=960&q=80', category: 'Land' },
            ]}
          />
        </Suspense>

        <InspectionNotes
          transcript="Main structure appears stable. Some wall repainting needed near rear side. Legal docs visible but cadastral reference should be rechecked."
          note={note}
          onNoteChange={setNote}
          onInsert={(text) => setNote((current) => `${current}${current ? '\n' : ''}${text}`)}
        />

        <AIRecommendation
          items={[
            'Need reinspection for electrical panel detail',
            'Need legal verification for title transfer appendix',
            'Need more photos for rear boundary fencing',
            'Need market confirmation from one additional comparable',
            'Need review by senior valuer before final submission',
          ]}
        />

        <AssessmentScore score={Math.round((score + checkedCount * 2.3) / 1.2)} />

        {!reportMode ? (
          <button type="button" className="as-open-report" onClick={() => setReportMode(true)}>
            Generate Assessment Report
          </button>
        ) : null}

        {reportMode ? (
          <Suspense fallback={<div className="as-card as-loading">Preparing report preview...</div>}>
            <ReportPreview
              propertyId="PROP-BKK-2208"
              owner="Somchai Pradit"
              recommendation={recommendationValue}
              score={Math.round((score + checkedCount * 2.3) / 1.2)}
              reasoning="AI reasoning blends image condition quality, locational strength, risk normalization and comparable sale behavior from nearby market clusters."
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
            <h2>Sync Status</h2>
            <p>
              {syncState === 'synced' ? 'Saved and synced to cloud successfully.' : null}
              {syncState === 'queued' ? 'Saved locally. Will sync when network is restored.' : null}
              {syncState === 'conflict' ? 'Potential sync conflict detected. Senior review required before merge.' : null}
            </p>
            <div className="as-sync-actions">
              <button type="button" onClick={() => navigate('/home')}>Back to Home</button>
              <button type="button" onClick={() => navigate('/map')}>Open Smart Map</button>
              <button type="button" onClick={() => navigate('/shared-intelligence')}>Open Shared Intelligence</button>
            </div>
          </section>
        ) : null}
      </motion.div>
    </Layout>
  )
}
