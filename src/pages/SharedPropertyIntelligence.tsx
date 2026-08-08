import { formatThaiCurrency } from '../lib/locale'
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Property } from '../types'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import SharedPropertyCard, { SharedPropertyCardData } from '../components/shared-intelligence/SharedPropertyCard'
import Timeline, { TimelineEvent } from '../components/shared-intelligence/Timeline'
import VersionHistory, { VersionItem } from '../components/shared-intelligence/VersionHistory'
import DuplicateCard from '../components/shared-intelligence/DuplicateCard'
import MiniMap from '../components/shared-intelligence/MiniMap'
import PropertyGallery from '../components/shared-intelligence/PropertyGallery'
import OfficerCard from '../components/shared-intelligence/OfficerCard'
import AISummaryCard from '../components/shared-intelligence/AISummaryCard'
import CopyActionSheet from '../components/shared-intelligence/CopyActionSheet'
import { BottomSheet } from '../components/ui'
import '../styles/shared-intelligence.css'

type SharedProperty = Property & SharedPropertyCardData & {
  propertyName: string
  projectName: string
  district: string
  subdistrict: string
  road: string
  telephone: string
  ocrText: string
  note: string
  versionHistory: VersionItem[]
  timeline: TimelineEvent[]
  nearby: Array<{ id: string; label: string; distance: string; price: number }>
  duplicateCandidate: { similarity: number; officer: string; captureDate: string; withinMeters: number } | null
  aiSummary: {
    ocrSummary: string
    marketInsight: string
    comparable: string
    risk: string
  }
}

type FilterKey = 'all' | 'nearby' | 'today' | 'week' | 'house' | 'semi' | 'townhome' | 'commercial' | 'condo' | 'land'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'nearby', label: 'ใกล้ฉัน' },
  { key: 'today', label: 'วันนี้' },
  { key: 'week', label: '7 วัน' },
  { key: 'house', label: 'บ้านเดี่ยว' },
  { key: 'semi', label: 'บ้านแฝด' },
  { key: 'townhome', label: 'ทาวน์โฮม' },
  { key: 'commercial', label: 'อาคารพาณิชย์' },
  { key: 'condo', label: 'คอนโด' },
  { key: 'land', label: 'ที่ดิน' },
]

const CACHE_KEY = 'fieldmate:shared-intelligence:cache'
const UPDATE_QUEUE_KEY = 'fieldmate:shared-intelligence:queue'
const districts = ['พระโขนง', 'บางนา', 'สวนหลวง', 'ห้วยขวาง', 'ปทุมวัน']
const subdistricts = ['บางจาก', 'อุดมสุข', 'อ่อนนุช', 'พระราม 9', 'ลุมพินี']
const roads = ['สุขุมวิท', 'บางนา-ตราด', 'พระราม 9', 'เพชรบุรี', 'สีลม']
const projects = ['คราวน์ เรสซิเดนซ์', 'ฮาร์เบอร์ เครสต์', 'เออร์เบิน ฟิลด์', 'แอมเบอร์ เทอร์เรซ', 'ลูมา ไฮท์']
const officers = ['นีนา รัตนกุล', 'กร สิทธิพงศ์', 'มะลิ จตุรนต์', 'พงศ์เกียรติ', 'อ้อม ดาริน']

function formatDateTime(value: string) {
  const date = new Date(value)
  return {
    date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
  }
}

function isToday(value: string) {
  return new Date(value).toDateString() === new Date().toDateString()
}

function isWithinWeek(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

function mapType(type?: string) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('semi') || lower.includes('twin')) return 'บ้านแฝด'
  if (lower.includes('town')) return 'ทาวน์โฮม'
  if (lower.includes('commercial')) return 'อาคารพาณิชย์'
  if (lower.includes('condo')) return 'คอนโด'
  if (lower.includes('land')) return 'ที่ดิน'
  return 'บ้านเดี่ยว'
}

function writeCache(properties: SharedProperty[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(properties))
  } catch {
    // ignore caching errors
  }
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as SharedProperty[]) : []
  } catch {
    return []
  }
}

function readQueue() {
  try {
    const raw = localStorage.getItem(UPDATE_QUEUE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: string[]) {
  try {
    localStorage.setItem(UPDATE_QUEUE_KEY, JSON.stringify(queue))
  } catch {
    // ignore queue errors
  }
}

function enrichProperty(property: Property, index: number, all: Property[]): SharedProperty {
  const district = districts[index % districts.length]
  const subdistrict = subdistricts[index % subdistricts.length]
  const road = roads[index % roads.length]
  const projectName = projects[index % projects.length]
  const officer = officers[index % officers.length]
  const propertyType = mapType(property.type)
  const dateTime = formatDateTime(property.lastInspection)
  const distanceKm = Number((0.4 + index * 0.7).toFixed(1))
  const nearby = all
    .filter((item) => item.id !== property.id)
    .slice(0, 4)
    .map((item, nearbyIndex) => ({
      id: item.id,
      label: `${projects[(index + nearbyIndex) % projects.length]} ${nearbyIndex + 1}`,
      distance: `${(0.7 + nearbyIndex * 0.8).toFixed(1)} กม.`,
      price: item.marketPrice,
    }))

  return {
    ...property,
    propertyName: `${projectName} ${district}`,
    projectName,
    district,
    subdistrict,
    road,
    telephone: `08${index}${(772300 + index).toString().padStart(6, '0')}`,
    ocrText: `ประกาศขาย ${formatThaiCurrency(property.marketPrice)} ใกล้ถนน${road} ติดต่อ ${officer}`,
    note: 'ภาพแนวรั้วและสภาพแวดล้อมชัดเจน ข้อความจากป้ายประกาศถูกอ่านด้วย OCR เรียบร้อยแล้ว',
    image: property.images[0],
    propertyType,
    salePrice: property.marketPrice,
    landArea: `${8 + index} ไร่ / ${1 + (index % 3)} งาน`,
    province: property.province,
    captureDate: dateTime.date,
    officer,
    aiConfidence: Math.min(97, 78 + (index % 5) * 4),
    gps: `${property.latitude.toFixed(4)}, ${property.longitude.toFixed(4)}`,
    distance: `${distanceKm.toFixed(1)} กม.`,
    bookmarked: index % 3 === 0,
    versionHistory: [
      { id: `${property.id}-v1`, officer, changed: 'บันทึกภาพภาคสนามและข้อมูล OCR เริ่มต้น', when: `${dateTime.date} ${dateTime.time}` },
      { id: `${property.id}-v2`, officer: officers[(index + 1) % officers.length], changed: 'แก้ไขพิกัด GPS และราคาตลาด', when: `${dateTime.date} 14:10` },
      { id: `${property.id}-v3`, officer: officers[(index + 2) % officers.length], changed: 'ทบทวนข้อมูลซ้ำซ้อนและบันทึกเสียง', when: `${dateTime.date} 16:40` },
    ],
    timeline: [
      { id: `${property.id}-t1`, stage: 'บันทึกภาพ', officer, date: dateTime.date, time: dateTime.time },
      { id: `${property.id}-t2`, stage: 'แก้ไขข้อมูล', officer: officers[(index + 1) % officers.length], date: dateTime.date, time: '14:10' },
      { id: `${property.id}-t3`, stage: 'ทบทวน', officer: officers[(index + 2) % officers.length], date: dateTime.date, time: '16:40' },
      { id: `${property.id}-t4`, stage: 'ยืนยันผล', officer: officers[(index + 3) % officers.length], date: dateTime.date, time: '18:05' },
    ],
    nearby,
    duplicateCandidate: index % 2 === 0 ? { similarity: 88 - (index % 4) * 3, officer: officers[(index + 1) % officers.length], captureDate: dateTime.date, withinMeters: 22 + index } : null,
    aiSummary: {
      ocrSummary: `OCR อ่านราคาขาย ชื่อถนน และเบอร์ติดต่อจากภาพภาคสนามของโครงการ ${projectName} ได้แล้ว`,
      marketInsight: `อุปสงค์ในเขต${district}ยังทรงตัวและมีแรงซื้อสำหรับโครงการที่อยู่ใกล้ถนน${road}`,
      comparable: nearby[0]?.label || 'รอข้อมูลทรัพย์เปรียบเทียบใกล้เคียง',
      risk: distanceKm < 2 ? 'ความเสี่ยงข้อมูลซ้ำต่ำ แต่มีผลกระทบจากการจราจรปานกลาง' : 'ความเสี่ยงข้อมูลซ้ำปานกลาง ควรตรวจแนวเขตเพิ่มเติม',
    },
  }
}

export default function SharedPropertyIntelligence() {
  const navigate = useNavigate()
  const { data: baseProperties = [], isError } = usePropertiesQuery()
  const [properties, setProperties] = useState<SharedProperty[]>([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [copySheetOpen, setCopySheetOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const [queuedUpdates, setQueuedUpdates] = useState<string[]>(() => readQueue())

  useEffect(() => {
    const syncState = () => {
      const online = navigator.onLine
      setOffline(!online)
      if (online) {
        writeQueue([])
        setQueuedUpdates([])
      }
    }

    window.addEventListener('online', syncState)
    window.addEventListener('offline', syncState)

    return () => {
      window.removeEventListener('online', syncState)
      window.removeEventListener('offline', syncState)
    }
  }, [])

  useEffect(() => {
    if (baseProperties.length) {
      const enriched = baseProperties.map((item, index, arr) => enrichProperty(item, index, arr))
      setProperties(enriched)
      setSelectedId(enriched[0]?.id || null)
      writeCache(enriched)
      return
    }

    if (isError) {
      const cached = readCache()
      setProperties(cached)
      setSelectedId(cached[0]?.id || null)
    }
  }, [baseProperties, isError])

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase()

    return properties.filter((item) => {
      const haystack = [
        item.propertyName,
        item.projectName,
        item.province,
        item.district,
        item.subdistrict,
        item.road,
        item.telephone,
        item.salePrice.toString(),
        item.propertyType,
        item.officer,
        item.gps,
        item.ocrText,
      ].join(' ').toLowerCase()

      const matchesQuery = !query || haystack.includes(query)
      const matchesFilter = (() => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'nearby') return Number(item.distance.replace(' กม.', '')) <= 3.5
        if (activeFilter === 'today') return isToday(item.lastInspection)
        if (activeFilter === 'week') return isWithinWeek(item.lastInspection)
        if (activeFilter === 'house') return item.propertyType === 'บ้านเดี่ยว'
        if (activeFilter === 'semi') return item.propertyType === 'บ้านแฝด'
        if (activeFilter === 'townhome') return item.propertyType === 'ทาวน์โฮม'
        if (activeFilter === 'commercial') return item.propertyType === 'อาคารพาณิชย์'
        if (activeFilter === 'condo') return item.propertyType === 'คอนโด'
        if (activeFilter === 'land') return item.propertyType === 'ที่ดิน'
        return true
      })()

      return matchesQuery && matchesFilter
    })
  }, [activeFilter, properties, search])

  const selectedProperty = filteredProperties.find((item) => item.id === selectedId) || filteredProperties[0] || null
  const recentUploads = filteredProperties.slice(0, 5)
  const nearbyProperties = filteredProperties.filter((item) => Number(item.distance.replace(' กม.', '')) <= 3.5).slice(0, 5)

  const toggleBookmark = (id: string) => {
    setProperties((current) => current.map((item) => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
    if (offline) {
      const next = [...queuedUpdates, `bookmark:${id}`]
      setQueuedUpdates(next)
      writeQueue(next)
    }
  }

  const shareProperty = (property: SharedProperty) => {
    setMessage(`เตรียมการแชร์ข้อมูลของ ${property.propertyName} แล้ว`)
  }

  const handleCopyAction = async (action: string) => {
    if (!selectedProperty) return
    let value = ''

    if (action === 'คัดลอกเบอร์โทร') value = selectedProperty.telephone
    if (action === 'คัดลอกราคา') value = `${selectedProperty.salePrice}`
    if (action === 'คัดลอกที่อยู่') value = `${selectedProperty.projectName}, ${selectedProperty.road}, ${selectedProperty.subdistrict}, ${selectedProperty.district}, ${selectedProperty.province}`
    if (action === 'คัดลอกพิกัด') value = selectedProperty.gps
    if (action === 'คัดลอก OCR') value = selectedProperty.ocrText
    if (action === 'คัดลอกทั้งหมด') value = `${selectedProperty.propertyName}\n${selectedProperty.telephone}\n${selectedProperty.salePrice}\n${selectedProperty.gps}\n${selectedProperty.ocrText}`

    try {
      await navigator.clipboard.writeText(value)
      setMessage(`${action} สำเร็จ`)
      setCopySheetOpen(false)
    } catch {
      setMessage('ไม่สามารถคัดลอกได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง')
    }
  }

  return (
    <Layout title="ข้อมูลทรัพย์สินส่วนกลาง" hideAssistant>
      <div className="spi-page">
        <motion.section className="spi-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div>
            <div className="spi-eyebrow">ข้อมูลทรัพย์สินส่วนกลาง</div>
            <h1>ศูนย์รวมข้อมูลทรัพย์สินสำหรับทีมภาคสนาม</h1>
            <p>รวมข้อมูลภาคสนามให้พร้อมใช้งานซ้ำได้ทั้งองค์กร เพื่อช่วยการสำรวจ ประเมิน และตรวจสอบทรัพย์สินได้เร็วขึ้น</p>
          </div>
          <div className="spi-hero-pills">
            <span>{offline ? 'ข้อมูลแคช' : 'ซิงก์แบบสด'}</span>
            <span>{queuedUpdates.length} รายการรอซิงก์</span>
          </div>
        </motion.section>

        <section className="spi-search-panel">
          <div className="spi-search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อทรัพย์ โครงการ จังหวัด เขต ถนน เบอร์โทร ราคา GPS หรือข้อความ OCR"
            />
            <button type="button" onClick={() => setMessage('โหมดค้นหาด้วยเสียงสำหรับเดโมพร้อมใช้งานแล้ว')}>เสียง</button>
          </div>
          <div className="spi-filter-row">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={activeFilter === filter.key ? 'is-active' : ''}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="spi-strip-section">
          <div className="spi-strip-title">อัปโหลดล่าสุด</div>
          <div className="spi-horizontal-rail">
            {recentUploads.length ? (
              recentUploads.map((property) => (
                <button key={property.id} type="button" className="spi-mini-card" onClick={() => setSelectedId(property.id)}>
                  <img src={property.image} alt={property.propertyName} />
                  <strong>{property.propertyName}</strong>
                  <span>{property.captureDate}</span>
                </button>
              ))
            ) : (
              <div className="spi-empty-note">ยังไม่มีรายการอัปโหลดล่าสุด</div>
            )}
          </div>
        </section>

        <section className="spi-strip-section">
          <div className="spi-strip-title">ทรัพย์สินใกล้เคียง</div>
          <div className="spi-horizontal-rail">
            {nearbyProperties.length ? (
              nearbyProperties.map((property) => (
                <button key={property.id} type="button" className="spi-mini-card" onClick={() => setSelectedId(property.id)}>
                  <img src={property.image} alt={property.propertyName} />
                  <strong>{property.propertyName}</strong>
                  <span>{property.distance}</span>
                </button>
              ))
            ) : (
              <div className="spi-empty-note">ยังไม่พบทรัพย์สินใกล้เคียงตามตัวกรองนี้</div>
            )}
          </div>
        </section>

        <section className="spi-list">
          {filteredProperties.length ? (
            filteredProperties.map((property) => (
              <SharedPropertyCard
                key={property.id}
                property={property}
                onOpen={() => setSelectedId(property.id)}
                onBookmark={() => toggleBookmark(property.id)}
                onShare={() => shareProperty(property)}
              />
            ))
          ) : (
            <div className="spi-empty-note">ไม่พบข้อมูลตามเงื่อนไขที่เลือก กรุณาปรับคำค้นหาหรือฟิลเตอร์</div>
          )}
        </section>

        <BottomSheet
          open={Boolean(selectedProperty)}
          mode="property"
          title="รายละเอียดทรัพย์สิน"
          onClose={() => navigate('/map')}
          footer={selectedProperty ? (
            <>
              <button type="button" onClick={() => navigate(`/survey/${selectedProperty.id}`)}>เริ่มสำรวจ</button>
              <button type="button" onClick={() => navigate('/map')}>นำทาง</button>
              <button type="button" onClick={() => setMessage('บันทึกข้อมูลทรัพย์สินเรียบร้อยแล้ว')}>บันทึก</button>
            </>
          ) : null}
        >
          {selectedProperty ? (
            <div className="spi-sheet-content">
              <DuplicateCard
                visible={Boolean(selectedProperty.duplicateCandidate && selectedProperty.duplicateCandidate.withinMeters <= 30)}
                similarity={selectedProperty.duplicateCandidate?.similarity || 0}
                officer={selectedProperty.duplicateCandidate?.officer || ''}
                captureDate={selectedProperty.duplicateCandidate?.captureDate || ''}
                onOpenExisting={() => setMessage('เปิดรายการที่อาจซ้ำแล้ว')}
                onCreateNew={() => setMessage('ยืนยันการสร้างรายการใหม่แล้ว')}
              />

              <PropertyGallery
                images={selectedProperty.images}
                onDownload={() => setMessage('เตรียมดาวน์โหลดรูปภาพแล้ว')}
                onCopy={() => setCopySheetOpen(true)}
              />

              <MiniMap
                coordinates={selectedProperty.gps}
                nearby={`${selectedProperty.road} • ${selectedProperty.distance}`}
                onOpenMap={() => navigate('/map')}
              />

              <section className="spi-section">
                <div className="spi-section-title">ข้อมูลทรัพย์สิน</div>
                <div className="spi-info-grid">
                  <div><span>ชื่อทรัพย์</span><strong>{selectedProperty.propertyName}</strong></div>
                  <div><span>โครงการ</span><strong>{selectedProperty.projectName}</strong></div>
                  <div><span>จังหวัด</span><strong>{selectedProperty.province}</strong></div>
                  <div><span>เขต/อำเภอ</span><strong>{selectedProperty.district}</strong></div>
                  <div><span>แขวง/ตำบล</span><strong>{selectedProperty.subdistrict}</strong></div>
                  <div><span>ถนน</span><strong>{selectedProperty.road}</strong></div>
                  <div><span>เบอร์โทร</span><strong>{selectedProperty.telephone}</strong></div>
                  <div><span>ราคาขาย</span><strong>{formatThaiCurrency(selectedProperty.salePrice)}</strong></div>
                  <div><span>GPS</span><strong>{selectedProperty.gps}</strong></div>
                  <div><span>OCR</span><strong>{selectedProperty.ocrText}</strong></div>
                </div>
              </section>

              <OfficerCard name={selectedProperty.officer} role="เจ้าหน้าที่ประเมินอาวุโส" updates={selectedProperty.versionHistory.length} />

              <Timeline items={selectedProperty.timeline} />

              <VersionHistory items={selectedProperty.versionHistory} onCompare={() => setMessage('เปิดเปรียบเทียบเวอร์ชันแล้ว')} />

              <AISummaryCard
                propertyType={selectedProperty.propertyType}
                ocrSummary={selectedProperty.aiSummary.ocrSummary}
                marketInsight={selectedProperty.aiSummary.marketInsight}
                comparable={selectedProperty.aiSummary.comparable}
                risk={selectedProperty.aiSummary.risk}
                confidence={selectedProperty.aiConfidence}
              />

              <section className="spi-section">
                <div className="spi-section-title">ประวัติการบันทึก</div>
                <div className="spi-history-copy">{selectedProperty.note}</div>
                <div className="spi-nearby-list">
                  {selectedProperty.nearby.map((item) => (
                    <button key={item.id} type="button" className="spi-nearby-item" onClick={() => setSelectedId(item.id)}>
                      <strong>{item.label}</strong>
                      <span>{item.distance}</span>
                      <span>{formatThaiCurrency(item.price)}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="spi-section">
                <div className="spi-section-title">ส่งออกข้อมูล</div>
                <div className="spi-inline-actions">
                  <button type="button" onClick={() => shareProperty(selectedProperty)}>แชร์</button>
                  <button type="button" onClick={() => setMessage('เตรียมไฟล์ Excel แล้ว')}>Excel</button>
                  <button type="button" onClick={() => setMessage('เตรียมไฟล์ PDF แล้ว')}>PDF</button>
                  <button type="button" onClick={() => setCopySheetOpen(true)}>คัดลอก</button>
                </div>
              </section>

              {message ? <div className="spi-toast">{message}</div> : null}
            </div>
          ) : null}
        </BottomSheet>

        <CopyActionSheet open={copySheetOpen} onClose={() => setCopySheetOpen(false)} onAction={handleCopyAction} />
      </div>
    </Layout>
  )
}
