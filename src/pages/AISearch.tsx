import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Property } from '../types'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import { EmptyState } from '../components/ui'
import SearchBar from '../components/search/SearchBar'
import SearchHistory, { SearchHistoryItem } from '../components/search/SearchHistory'
import AISuggestion from '../components/search/AISuggestion'
import SearchResultCard, { SearchResult } from '../components/search/SearchResultCard'
import TrendingCard from '../components/search/TrendingCard'
import '../styles/search.css'
import { staggerItem, staggerList } from '../theme/motion'

const FilterSheet = lazy(() => import('../components/search/FilterSheet'))
const VoiceSearch = lazy(() => import('../components/search/VoiceSearch'))
const ImageSearch = lazy(() => import('../components/search/ImageSearch'))
const ResultBottomSheet = lazy(() => import('../components/search/ResultBottomSheet'))

type SearchFilters = {
  province: string
  district: string
  propertyType: string
  priceRange: string
  area: string
  officer: string
  date: string
}

type SearchEntity = SearchResult & {
  inspectedAt: string
  project: string
  province: string
  district: string
  subdistrict: string
  road: string
  telephone: string
  owner: string
  officerRole: string
  ocrText: string
  aiSummary: string
  assessment: string
  photoLabel: string
  propertyId: string
  aid: string
  categories: string[]
  timeline: Array<{ id: string; title: string; meta: string }>
  comparable: Array<{ id: string; label: string; price: number }>
  mapText: string
  gallery: string[]
}

const CATEGORY_OPTIONS = ['ทรัพย์สิน', 'โครงการ', 'ภาพถ่าย', 'เอกสาร', 'รายงาน AI', 'แผนที่', 'ทรัพย์เปรียบเทียบ'] as const
const HISTORY_KEY = 'fieldmate:search:history'
const projectPool = ['แอมเบอร์ ฟิลด์ส', 'เออร์เบิน เครสต์', 'สุขุมวิท ไพรม์', 'ฮาร์เบอร์ วิว', 'ลูมา เรสซิเดนซ์']
const districtPool = ['บางนา', 'พระโขนง', 'สวนหลวง', 'รัชดา', 'ลาดพร้าว']
const subdistrictPool = ['บางนาเหนือ', 'บางจาก', 'อ่อนนุช', 'ห้วยขวาง', 'จอมพล']
const roadPool = ['สุขุมวิท', 'บางนา-ตราด', 'พระราม 9', 'เพชรบุรี', 'ลาดพร้าว']
const officerPool = ['นีนา รัตนกุล', 'กร สิทธิพงศ์', 'มะลิ จตุรนต์', 'พงศ์เกียรติ', 'อ้อม ดาริน']

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as SearchHistoryItem[]) : []
  } catch {
    return []
  }
}

function writeHistory(items: SearchHistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

function typeLabel(type?: string) {
  const lower = (type || '').toLowerCase()
  if (lower.includes('condo')) return 'คอนโดมิเนียม'
  if (lower.includes('commercial')) return 'พาณิชยกรรม'
  if (lower.includes('town')) return 'ทาวน์โฮม'
  if (lower.includes('land')) return 'ที่ดิน'
  return 'บ้านเดี่ยว'
}

function enrichProperty(property: Property, index: number, all: Property[]): SearchEntity {
  const project = projectPool[index % projectPool.length]
  const district = districtPool[index % districtPool.length]
  const subdistrict = subdistrictPool[index % subdistrictPool.length]
  const road = roadPool[index % roadPool.length]
  const officer = officerPool[index % officerPool.length]
  const distanceKm = (0.6 + index * 0.45).toFixed(1)
  const title = `${project} ${district}`
  const category = CATEGORY_OPTIONS[index % CATEGORY_OPTIONS.length]
  const propertyType = typeLabel(property.type)

  return {
    id: property.id,
    title,
    image: property.images[0],
    price: property.marketPrice,
    inspectedAt: property.lastInspection,
    distance: `${distanceKm} กม.`,
    officer,
    aiConfidence: Math.min(97, 79 + (index % 5) * 4),
    bookmarked: index % 4 === 0,
    category,
    subtitle: `${propertyType} • ${property.province} • ${road}`,
    project,
    province: property.province,
    district,
    subdistrict,
    road,
    telephone: `08${(index + 2).toString()}${(761230 + index).toString().padStart(6, '0')}`,
    owner: property.owner,
    officerRole: 'ผู้ประเมินภาคสนามอาวุโส',
    ocrText: `พบป้ายขายบนถนน${road} ราคา ${property.marketPrice.toLocaleString('th-TH')} บาท ติดต่อ ${property.owner}`,
    aiSummary: `โซน${district} มีทางเข้าออกดีและมีหลักฐานภาพถ่ายชัดเจน`,
    assessment: index % 2 === 0 ? 'พร้อมประเมิน' : 'รอตรวจยืนยัน',
    photoLabel: index % 3 === 0 ? 'ป้ายขาย' : index % 3 === 1 ? 'ภาพด้านหน้า' : 'เอกสาร',
    propertyId: property.id,
    aid: `รหัส-${2400 + index}`,
    categories: Array.from(new Set([category, 'ทรัพย์สิน', index % 3 === 0 ? 'ภาพถ่าย' : 'รายงาน AI', propertyType === 'คอนโดมิเนียม' ? 'ทรัพย์เปรียบเทียบ' : 'แผนที่'])),
    timeline: [
      { id: `${property.id}-1`, title: 'บันทึกภาพ', meta: `${officer} • ${new Date(property.lastInspection).toLocaleDateString('th-TH')}` },
      { id: `${property.id}-2`, title: 'ตรวจสอบ', meta: `${officerPool[(index + 1) % officerPool.length]} • ซิงก์ OCR แล้ว` },
      { id: `${property.id}-3`, title: 'ประเมิน', meta: `${index % 2 === 0 ? 'เสร็จสิ้น' : 'รอจัดทำแบบร่าง'}` },
    ],
    comparable: all.filter((item) => item.id !== property.id).slice(0, 3).map((item, comparableIndex) => ({
      id: item.id,
      label: `${projectPool[(index + comparableIndex + 1) % projectPool.length]} ${comparableIndex + 1}`,
      price: item.marketPrice,
    })),
    mapText: `${district} • ${property.latitude.toFixed(4)}, ${property.longitude.toFixed(4)}`,
    gallery: [property.images[0], property.images[0], property.images[0]],
  }
}

function parsePriceCap(query: string) {
  const millionMatch = query.match(/(\d+(?:\.\d+)?)\s*ล้าน/)
  if (millionMatch) return Number(millionMatch[1]) * 1000000
  const digitMatch = query.match(/ไม่เกิน\s*(\d+)/)
  return digitMatch ? Number(digitMatch[1]) : null
}

export default function AISearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => readHistory())
  const [entities, setEntities] = useState<SearchEntity[]>([])
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>('ทรัพย์สิน')
  const [filters, setFilters] = useState<SearchFilters>({ province: '', district: '', propertyType: '', priceRange: '', area: '', officer: '', date: '' })
  const [filterOpen, setFilterOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const { data: properties = [], isError, refetch } = usePropertiesQuery()
  const favorites = useMemo(() => history.filter((item) => item.pinned), [history])

  useEffect(() => {
    setEntities(properties.map((item, index, all) => enrichProperty(item, index, all)))
  }, [properties])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 180)
    return () => window.clearTimeout(timer)
  }, [query])

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []
    const pool = [
      'บ้านเดี่ยวแถวบางนา',
      'คอนโดที่ฉันถ่ายเมื่อวาน',
      'บ้านราคาไม่เกิน 5 ล้าน',
      'รูปที่มีป้ายขาย',
      'ทรัพย์ของคุณสมชาย',
      'OCR โฉนด บางนา',
      'รหัส-2404',
    ]
    return pool.filter((item) => item.toLowerCase().includes(trimmed) || trimmed.split(' ').some((token) => item.toLowerCase().includes(token))).slice(0, 5)
  }, [query])

  const filteredResults = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase()
    const priceCap = parsePriceCap(trimmed)
    const wantsYesterday = trimmed.includes('เมื่อวาน')
    const wantsSaleSign = trimmed.includes('ป้ายขาย')

    return entities.filter((item) => {
      const haystack = [
        item.title,
        item.project,
        item.telephone,
        item.mapText,
        item.province,
        item.district,
        item.subdistrict,
        item.road,
        item.owner,
        item.officer,
        item.ocrText,
        item.aiSummary,
        item.assessment,
        item.photoLabel,
        item.propertyId,
        item.aid,
      ].join(' ').toLowerCase()

      const matchesQuery = !trimmed || haystack.includes(trimmed) || trimmed.split(' ').every((token) => haystack.includes(token))
      const matchesCategory = item.categories.includes(selectedCategory)
      const matchesPrice = priceCap === null || item.price <= priceCap
      const matchesYesterday = !wantsYesterday || Date.now() - new Date(item.inspectedAt).getTime() <= 2 * 24 * 60 * 60 * 1000
      const matchesSign = !wantsSaleSign || item.photoLabel.includes('ป้ายขาย') || item.ocrText.includes('ป้ายขาย')
      const matchesFilters =
        (!filters.province || item.province.toLowerCase().includes(filters.province.toLowerCase())) &&
        (!filters.district || item.district.toLowerCase().includes(filters.district.toLowerCase())) &&
        (!filters.propertyType || item.subtitle.toLowerCase().includes(filters.propertyType.toLowerCase())) &&
        (!filters.officer || item.officer.toLowerCase().includes(filters.officer.toLowerCase()))

      return matchesQuery && matchesCategory && matchesPrice && matchesYesterday && matchesSign && matchesFilters
    })
  }, [debouncedQuery, entities, filters, selectedCategory])

  const trending = useMemo(() => {
    return [
      { title: 'เปิดบ่อย', subtitle: 'รายการที่เปิดมากที่สุดสัปดาห์นี้', value: entities[0]?.title || 'แอมเบอร์ ฟิลด์ส' },
      { title: 'อัปเดตล่าสุด', subtitle: 'ข้อมูล OCR และ AI ใหม่ล่าสุด', value: entities[1]?.title || 'เออร์เบิน เครสต์' },
      { title: 'ใกล้คุณ', subtitle: 'เข้าถึงรวดเร็วจากตำแหน่งปัจจุบัน', value: entities[2]?.title || 'สุขุมวิท ไพรม์' },
    ]
  }, [entities])

  const selectedResult = filteredResults.find((item) => item.id === selectedId) || entities.find((item) => item.id === selectedId) || null

  const commitHistory = (nextQuery: string) => {
    const trimmed = nextQuery.trim()
    if (!trimmed) return
    setHistory((current) => {
      const next = [{ id: `search-${Date.now()}`, query: trimmed, pinned: false }, ...current.filter((item) => item.query !== trimmed)].slice(0, 8)
      writeHistory(next)
      return next
    })
  }

  const useQuery = (nextQuery: string) => {
    setQuery(nextQuery)
    setDebouncedQuery(nextQuery)
    commitHistory(nextQuery)
  }

  const deleteHistory = (id: string) => {
    setHistory((current) => {
      const next = current.filter((item) => item.id !== id)
      writeHistory(next)
      return next
    })
  }

  const togglePin = (id: string) => {
    setHistory((current) => {
      const next = current.map((item) => item.id === id ? { ...item, pinned: !item.pinned } : item).sort((a, b) => Number(b.pinned) - Number(a.pinned))
      writeHistory(next)
      return next
    })
  }

  const toggleBookmark = (id: string) => {
    setEntities((current) => current.map((item) => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item))
  }

  return (
    <Layout title="ค้นหาข้อมูลอัจฉริยะ" hideAssistant>
      <motion.div className="ais-page" variants={staggerList} initial="hidden" animate="visible">
        {isError ? (
          <motion.section className="ais-block" variants={staggerItem}>
            <div className="ais-block-title">ไม่สามารถโหลดข้อมูลได้</div>
            <p style={{ margin: 0, color: '#6f6456', fontSize: 13 }}>โปรดลองเชื่อมต่อเครือข่ายอีกครั้งเพื่ออัปเดตผลค้นหา</p>
            <button type="button" className="is-primary" onClick={() => void refetch()}>ลองอีกครั้ง</button>
          </motion.section>
        ) : null}

        <motion.section className="ais-hero" variants={staggerItem} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <h1>ค้นหาอัจฉริยะ</h1>
          <p>ค้นหาข้อมูลทรัพย์ รูปถ่าย OCR และสรุป AI ได้แบบเรียลไทม์บนมือถือ</p>
        </motion.section>

        <SearchBar value={query} onChange={setQuery} onVoice={() => setVoiceOpen(true)} onCamera={() => setImageOpen(true)} />

        <div className="ais-top-actions">
          <button type="button" onClick={() => commitHistory(query)}>ค้นหา</button>
          <button type="button" onClick={() => setFilterOpen(true)}>ตัวกรอง</button>
        </div>

        <AISuggestion suggestions={suggestions} onSelect={useQuery} />

        <motion.section className="ais-block" variants={staggerItem}>
          <div className="ais-block-title">หมวดหมู่</div>
          <div className="ais-category-row">
            {CATEGORY_OPTIONS.map((category) => (
              <button key={category} type="button" className={selectedCategory === category ? 'is-active' : ''} onClick={() => setSelectedCategory(category)}>
                {category}
              </button>
            ))}
          </div>
        </motion.section>

        <SearchHistory items={history} onSelect={useQuery} onDelete={deleteHistory} onPin={togglePin} />

        {favorites.length ? (
          <motion.section className="ais-block" variants={staggerItem}>
            <div className="ais-block-title">ค้นหาที่บันทึกไว้</div>
            <div className="ais-category-row">
              {favorites.map((item) => (
                <button key={item.id} type="button" className="is-active" onClick={() => useQuery(item.query)}>
                  {item.query}
                </button>
              ))}
            </div>
          </motion.section>
        ) : null}

        <motion.section className="ais-block" variants={staggerItem}>
          <div className="ais-block-title">รายการยอดนิยม</div>
          <div className="ais-trending-row">
            {trending.map((item) => (
              <TrendingCard key={item.title} title={item.title} subtitle={item.subtitle} value={item.value} onSelect={() => setQuery(item.value)} />
            ))}
          </div>
        </motion.section>

        <motion.section className="ais-results-section" variants={staggerItem}>
          <div className="ais-results-head">
            <div className="ais-block-title">ผลลัพธ์</div>
            <span>{filteredResults.length} รายการ</span>
          </div>
          {filteredResults.length ? (
          <div className="ais-results-list">
            {filteredResults.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                onOpen={() => {
                  setSelectedId(result.id)
                  commitHistory(query || result.title)
                }}
                onBookmark={() => toggleBookmark(result.id)}
              />
            ))}
          </div>
          ) : (
            <EmptyState
              title="ยังไม่พบข้อมูลที่ตรงกับคำค้นหา"
              description="ลองปรับคำค้นหา หรือเปิดดูข้อมูลใกล้เคียงจากพื้นที่สำรวจล่าสุด"
              action={<button type="button" className="is-primary" onClick={() => setQuery('ทรัพย์ใกล้ฉัน')}>ค้นหาทรัพย์ใกล้ฉัน</button>}
            />
          )}
        </motion.section>

        {toast ? <div className="ais-toast">{toast}</div> : null}

        <Suspense fallback={null}>
          <FilterSheet
            open={filterOpen}
            value={filters}
            onClose={() => setFilterOpen(false)}
            onApply={(next) => {
              setFilters(next)
              setFilterOpen(false)
            }}
          />
          <VoiceSearch
            open={voiceOpen}
            onClose={() => setVoiceOpen(false)}
            onUse={(next) => {
              useQuery(next)
              setVoiceOpen(false)
            }}
          />
          <ImageSearch
            open={imageOpen}
            onClose={() => setImageOpen(false)}
            onUse={(next) => {
              useQuery(next)
              setImageOpen(false)
            }}
          />
          <ResultBottomSheet
            open={Boolean(selectedResult)}
            result={selectedResult}
            onClose={() => setSelectedId(null)}
            onOpenMap={() => navigate('/map')}
            onOpenCamera={() => navigate('/camera')}
            onOpenAssessment={() => navigate('/assessment')}
            onShare={() => setToast('เตรียมหน้าต่างแชร์แล้ว')}
            onCopy={async () => {
              if (!selectedResult) return
              await navigator.clipboard.writeText(`${selectedResult.title}\n${selectedResult.subtitle}\n${selectedResult.mapText}`)
              setToast('คัดลอกสรุปทรัพย์สินแล้ว')
            }}
            onBookmark={() => {
              if (!selectedResult) return
              toggleBookmark(selectedResult.id)
              setToast('อัปเดตรายการบันทึกแล้ว')
            }}
          />
        </Suspense>
      </motion.div>
    </Layout>
  )
}
