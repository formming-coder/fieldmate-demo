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
import BottomSheet from '../components/shared-intelligence/BottomSheet'
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
const districts = ['Phra Khanong', 'Bang Na', 'Suan Luang', 'Huai Khwang', 'Pathum Wan']
const subdistricts = ['Bang Chak', 'Udom Suk', 'On Nut', 'Rama 9', 'Lumphini']
const roads = ['Sukhumvit', 'Bangna-Trad', 'Rama 9', 'Phetchaburi', 'Silom']
const projects = ['Crown Residence', 'Harbor Crest', 'Urban Field', 'Amber Terrace', 'Luma Heights']
const officers = ['Nina Rattanakul', 'Korn Sitthipong', 'Mali Chaturon', 'Pong Kiet', 'Aom Darin']

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
      distance: `${(0.7 + nearbyIndex * 0.8).toFixed(1)} km`,
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
    ocrText: `For sale ${property.marketPrice.toLocaleString()} THB near ${road} contact ${officer}`,
    note: 'Boundary fence captured clearly. OCR from signage synced successfully.',
    image: property.images[0],
    propertyType,
    salePrice: property.marketPrice,
    landArea: `${8 + index} Rai / ${1 + (index % 3)} Ngan`,
    province: property.province,
    captureDate: dateTime.date,
    officer,
    aiConfidence: Math.min(97, 78 + (index % 5) * 4),
    gps: `${property.latitude.toFixed(4)}, ${property.longitude.toFixed(4)}`,
    distance: `${distanceKm.toFixed(1)} km`,
    bookmarked: index % 3 === 0,
    versionHistory: [
      { id: `${property.id}-v1`, officer, changed: 'Captured initial field photos and OCR text', when: `${dateTime.date} ${dateTime.time}` },
      { id: `${property.id}-v2`, officer: officers[(index + 1) % officers.length], changed: 'Edited GPS notes and market price', when: `${dateTime.date} 14:10` },
      { id: `${property.id}-v3`, officer: officers[(index + 2) % officers.length], changed: 'Reviewed duplicate signals and voice note', when: `${dateTime.date} 16:40` },
    ],
    timeline: [
      { id: `${property.id}-t1`, stage: 'Captured', officer, date: dateTime.date, time: dateTime.time },
      { id: `${property.id}-t2`, stage: 'Edited', officer: officers[(index + 1) % officers.length], date: dateTime.date, time: '14:10' },
      { id: `${property.id}-t3`, stage: 'Reviewed', officer: officers[(index + 2) % officers.length], date: dateTime.date, time: '16:40' },
      { id: `${property.id}-t4`, stage: 'Verified', officer: officers[(index + 3) % officers.length], date: dateTime.date, time: '18:05' },
    ],
    nearby,
    duplicateCandidate: index % 2 === 0 ? { similarity: 88 - (index % 4) * 3, officer: officers[(index + 1) % officers.length], captureDate: dateTime.date, withinMeters: 22 + index } : null,
    aiSummary: {
      ocrSummary: `OCR parsed sale price, road name and contact number from field photo for ${projectName}.`,
      marketInsight: `${district} demand stable with strong residential absorption near ${road}.`,
      comparable: nearby[0]?.label || 'Nearby reference pending',
      risk: distanceKm < 2 ? 'Low duplicate risk, moderate traffic exposure' : 'Medium duplicate risk, verify boundary lines',
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
        if (activeFilter === 'nearby') return Number(item.distance.replace(' km', '')) <= 3.5
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
  const nearbyProperties = filteredProperties.filter((item) => Number(item.distance.replace(' km', '')) <= 3.5).slice(0, 5)

  const toggleBookmark = (id: string) => {
    setProperties((current) => current.map((item) => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
    if (offline) {
      const next = [...queuedUpdates, `bookmark:${id}`]
      setQueuedUpdates(next)
      writeQueue(next)
    }
  }

  const shareProperty = (property: SharedProperty) => {
    setMessage(`Share sheet prepared for ${property.propertyName}`)
  }

  const handleCopyAction = async (action: string) => {
    if (!selectedProperty) return
    let value = ''

    if (action === 'Copy Telephone') value = selectedProperty.telephone
    if (action === 'Copy Price') value = `${selectedProperty.salePrice}`
    if (action === 'Copy Address') value = `${selectedProperty.projectName}, ${selectedProperty.road}, ${selectedProperty.subdistrict}, ${selectedProperty.district}, ${selectedProperty.province}`
    if (action === 'Copy Coordinates') value = selectedProperty.gps
    if (action === 'Copy OCR') value = selectedProperty.ocrText
    if (action === 'Copy All') value = `${selectedProperty.propertyName}\n${selectedProperty.telephone}\n${selectedProperty.salePrice}\n${selectedProperty.gps}\n${selectedProperty.ocrText}`

    await navigator.clipboard.writeText(value)
    setMessage(`${action} completed`)
    setCopySheetOpen(false)
  }

  return (
    <Layout title="Shared Property Database" hideAssistant>
      <div className="spi-page">
        <motion.section className="spi-hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div>
            <div className="spi-eyebrow">Shared Property Database</div>
            <h1>Shared Property Intelligence</h1>
            <p>Mobile-first shared intelligence for property valuers. Every field capture becomes reusable evidence for the whole organization.</p>
          </div>
          <div className="spi-hero-pills">
            <span>{offline ? 'Cached Data' : 'Live Sync'}</span>
            <span>{queuedUpdates.length} queued</span>
          </div>
        </motion.section>

        <section className="spi-search-panel">
          <div className="spi-search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Property, project, province, district, road, telephone, price, GPS, OCR text"
            />
            <button type="button">Voice</button>
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
          <div className="spi-strip-title">Recent uploads</div>
          <div className="spi-horizontal-rail">
            {recentUploads.map((property) => (
              <button key={property.id} type="button" className="spi-mini-card" onClick={() => setSelectedId(property.id)}>
                <img src={property.image} alt={property.propertyName} />
                <strong>{property.propertyName}</strong>
                <span>{property.captureDate}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="spi-strip-section">
          <div className="spi-strip-title">Nearby properties</div>
          <div className="spi-horizontal-rail">
            {nearbyProperties.map((property) => (
              <button key={property.id} type="button" className="spi-mini-card" onClick={() => setSelectedId(property.id)}>
                <img src={property.image} alt={property.propertyName} />
                <strong>{property.propertyName}</strong>
                <span>{property.distance}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="spi-list">
          {filteredProperties.map((property) => (
            <SharedPropertyCard
              key={property.id}
              property={property}
              onOpen={() => setSelectedId(property.id)}
              onBookmark={() => toggleBookmark(property.id)}
              onShare={() => shareProperty(property)}
            />
          ))}
        </section>

        <BottomSheet open={Boolean(selectedProperty)} onClose={() => setSelectedId(null)}>
          {selectedProperty ? (
            <div className="spi-sheet-content">
              <DuplicateCard
                visible={Boolean(selectedProperty.duplicateCandidate && selectedProperty.duplicateCandidate.withinMeters <= 30)}
                similarity={selectedProperty.duplicateCandidate?.similarity || 0}
                officer={selectedProperty.duplicateCandidate?.officer || ''}
                captureDate={selectedProperty.duplicateCandidate?.captureDate || ''}
                onOpenExisting={() => setMessage('Opened possible duplicate record')}
                onCreateNew={() => setMessage('Create new record confirmed')}
              />

              <PropertyGallery
                images={selectedProperty.images}
                onDownload={() => setMessage('Image download prepared')}
                onCopy={() => setCopySheetOpen(true)}
              />

              <MiniMap
                coordinates={selectedProperty.gps}
                nearby={`${selectedProperty.road} • ${selectedProperty.distance}`}
                onOpenMap={() => navigate('/map')}
              />

              <section className="spi-section">
                <div className="spi-section-title">Property Information</div>
                <div className="spi-info-grid">
                  <div><span>Property Name</span><strong>{selectedProperty.propertyName}</strong></div>
                  <div><span>Project</span><strong>{selectedProperty.projectName}</strong></div>
                  <div><span>Province</span><strong>{selectedProperty.province}</strong></div>
                  <div><span>District</span><strong>{selectedProperty.district}</strong></div>
                  <div><span>Subdistrict</span><strong>{selectedProperty.subdistrict}</strong></div>
                  <div><span>Road</span><strong>{selectedProperty.road}</strong></div>
                  <div><span>Telephone</span><strong>{selectedProperty.telephone}</strong></div>
                  <div><span>Sale Price</span><strong>THB {selectedProperty.salePrice.toLocaleString()}</strong></div>
                  <div><span>GPS</span><strong>{selectedProperty.gps}</strong></div>
                  <div><span>OCR</span><strong>{selectedProperty.ocrText}</strong></div>
                </div>
              </section>

              <OfficerCard name={selectedProperty.officer} role="Senior Valuation Officer" updates={selectedProperty.versionHistory.length} />

              <Timeline items={selectedProperty.timeline} />

              <VersionHistory items={selectedProperty.versionHistory} onCompare={() => setMessage('Version compare opened')} />

              <AISummaryCard
                propertyType={selectedProperty.propertyType}
                ocrSummary={selectedProperty.aiSummary.ocrSummary}
                marketInsight={selectedProperty.aiSummary.marketInsight}
                comparable={selectedProperty.aiSummary.comparable}
                risk={selectedProperty.aiSummary.risk}
                confidence={selectedProperty.aiConfidence}
              />

              <section className="spi-section">
                <div className="spi-section-title">Capture History</div>
                <div className="spi-history-copy">{selectedProperty.note}</div>
                <div className="spi-nearby-list">
                  {selectedProperty.nearby.map((item) => (
                    <button key={item.id} type="button" className="spi-nearby-item" onClick={() => setSelectedId(item.id)}>
                      <strong>{item.label}</strong>
                      <span>{item.distance}</span>
                      <span>THB {item.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="spi-section">
                <div className="spi-section-title">Export</div>
                <div className="spi-inline-actions">
                  <button type="button" onClick={() => shareProperty(selectedProperty)}>Share</button>
                  <button type="button" onClick={() => setMessage('Excel export prepared')}>Excel</button>
                  <button type="button" onClick={() => setMessage('PDF export prepared')}>PDF</button>
                  <button type="button" onClick={() => setCopySheetOpen(true)}>Copy</button>
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
