import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { fetchProperties } from '../api/mockApi'
import { Property } from '../types'
import styles from './SharedPropertyIntelligence.module.css'

type CommentItem = {
  id: string
  officer: string
  text: string
  likes: number
  resolved: boolean
}

type KnowledgeProperty = Property & {
  district: string
  road: string
  village: string
  condominium: string
  phoneNumbers: string[]
  captureDate: string
  capturedBy: string
  photoCount: number
  updateCount: number
  knowledgeScore: number
  distanceKm: number
  address: string
  projectName: string
  landArea: string
  usableArea: string
  inspectionDate: string
  remarks: string
  statusLabel: string
  history: Array<{ officer: string; date: string; action: string }>
  comments: CommentItem[]
}

const filterOptions = [
  'ใกล้ฉัน',
  'บันทึกวันนี้',
  'บันทึกสัปดาห์นี้',
  'ที่ดินว่าง',
  'บ้านเดี่ยว',
  'ทาวน์เฮาส์คู่',
  'ทาวน์เฮาส์',
  'อาคารพาณิชย์',
  'คอนโดมิเนียม',
]

const districtPool = ['Suan Luang', 'Ratchada', 'Phra Khanong', 'Siam', 'Bangna']
const roadPool = ['Rama 9', 'Sukhumvit', 'Phetkasem', 'Silom', 'Chaeng Watthana']
const villagePool = ['Banmai', 'Nawamin', 'Samyan', 'Lumpini', 'Chula']
const condominiumPool = ['The Crest', 'Avenue 88', 'Riverline', 'Harbor Point', 'Lumen']
const officerPool = ['Nina', 'Korn', 'Mali', 'Pong', 'Aom']
const projectPool = ['River Crest', 'Harbor View', 'North Point', 'Peak Square', 'Crown Residence']
const remarksPool = [
  'หน้าตาอาคารดีและสถานะกฎหมายชัดเจน',
  'ต้องเข้าตรวจไซต์ใหม่เพื่อประเมินสภาพรั้ว',
  'มีมูลค่าการนำกลับมาใช้กับทรัพย์สินใกล้เคียงสูง',
  'มีศักยภาพปรับปรุงและเข้าถึงเส้นทางได้รวดเร็ว',
]

function formatCurrency(value: number) {
  return `THB ${value.toLocaleString()}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isToday(value: string) {
  const now = new Date()
  const target = new Date(value)
  return target.toDateString() === now.toDateString()
}

function isThisWeek(value: string) {
  const now = new Date()
  const target = new Date(value)
  const diff = now.getTime() - target.getTime()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

function buildKnowledgeProperty(property: Property, index: number): KnowledgeProperty {
  const captureDate = new Date(property.lastInspection)
  const district = districtPool[index % districtPool.length]
  const road = roadPool[index % roadPool.length]
  const village = villagePool[index % villagePool.length]
  const condominium = condominiumPool[index % condominiumPool.length]
  const capturedBy = officerPool[index % officerPool.length]
  const projectName = projectPool[index % projectPool.length]
  const type = property.type || 'บ้านเดี่ยว'

  return {
    ...property,
    district,
    road,
    village,
    condominium,
    phoneNumbers: [`+66 ${80 + index} ${100000 + index}`.replace(/\s+/g, ' ')],
    captureDate: property.lastInspection,
    capturedBy,
    photoCount: 6 + (index % 4),
    updateCount: 1 + (index % 3),
    knowledgeScore: 84 + (index % 6) * 2,
    distanceKm: Number((1.2 + index * 0.6).toFixed(1)),
    address: `${index + 1}/${index + 5}, ${road}, ${village}`,
    projectName,
    landArea: `${10 + index} Rai / ${2 + (index % 3)} Ngan`,
    usableArea: `${220 + index * 15} m²`,
    inspectionDate: property.lastInspection,
    remarks: remarksPool[index % remarksPool.length],
    statusLabel: ['พร้อมใช้', 'ต้องตรวจสอบ', 'ขายแล้ว', 'ซ้ำ', 'ป้ายถูกถอด'][index % 5],
    history: [
      { officer: capturedBy, date: formatDate(property.lastInspection), action: 'เพิ่มภาพถ่ายใหม่' },
      { officer: 'Mali', date: formatDate(new Date(property.lastInspection).toISOString()), action: 'อัปเดตราคา' },
      { officer: 'Pong', date: formatDate(new Date(Date.now() - 86400000 * 2).toISOString()), action: 'อัปเดตพิกัด GPS' },
      { officer: 'Nina', date: formatDate(new Date(Date.now() - 86400000 * 4).toISOString()), action: 'แก้ไขหมายเหตุ' },
    ],
    comments: [
      {
        id: `comment-${index}-1`,
        officer: 'Nina',
        text: 'ชุดภาพดีมากสำหรับใช้ซ้ำในงานประเมินในอนาคต',
        likes: 3,
        resolved: false,
      },
      {
        id: `comment-${index}-2`,
        officer: 'Korn',
        text: `ตรวจสถานะ${type.toLowerCase()}ก่อนแชร์ต่อภายนอก`,
        likes: 1,
        resolved: true,
      },
    ],
  }
}

export default function SharedPropertyIntelligence() {
  const [properties, setProperties] = useState<KnowledgeProperty[]>([])
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    let mounted = true
    fetchProperties().then((list) => {
      if (!mounted) return
      const enriched = list.map((item, index) => buildKnowledgeProperty(item, index))
      setProperties(enriched)
      setSelectedId((current) => current ?? enriched[0]?.id ?? null)
    })
    return () => {
      mounted = false
    }
  }, [])

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase()

    return properties.filter((item) => {
      const haystack = [
        item.province,
        item.district,
        item.road,
        item.village,
        item.condominium,
        item.phoneNumbers.join(' '),
        item.marketPrice.toString(),
        item.type || '',
        formatDate(item.captureDate),
        item.capturedBy,
        item.address,
        item.projectName,
      ]
        .join(' ')
        .toLowerCase()

      const matchesQuery = !query || haystack.includes(query)
      const matchesFilters = activeFilters.every((filter) => {
        switch (filter) {
          case 'ใกล้ฉัน':
            return item.distanceKm <= 4
          case 'บันทึกวันนี้':
            return isToday(item.captureDate)
          case 'บันทึกสัปดาห์นี้':
            return isThisWeek(item.captureDate)
          case 'ที่ดินว่าง':
            return item.type?.toLowerCase() === 'vacant land'
          case 'บ้านเดี่ยว':
            return item.type?.toLowerCase() === 'detached house'
          case 'ทาวน์เฮาส์คู่':
            return item.type?.toLowerCase() === 'semi-detached house'
          case 'ทาวน์เฮาส์':
            return item.type?.toLowerCase() === 'townhouse'
          case 'อาคารพาณิชย์':
            return item.type?.toLowerCase() === 'commercial building'
          case 'คอนโดมิเนียม':
            return item.type?.toLowerCase() === 'condominium'
          default:
            return true
        }
      })

      return matchesQuery && matchesFilters
    })
  }, [properties, search, activeFilters])

  useEffect(() => {
    if (!filteredProperties.length) {
      setSelectedId(null)
      return
    }

    if (!filteredProperties.some((item) => item.id === selectedId)) {
      setSelectedId(filteredProperties[0].id)
    }
  }, [filteredProperties, selectedId])

  const selectedProperty = filteredProperties.find((item) => item.id === selectedId) || filteredProperties[0] || null

  const toggleFilter = (filter: string) => {
    setActiveFilters((current) => (current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]))
  }

  const addComment = () => {
    if (!selectedProperty || !commentDraft.trim()) return

    const nextComment: CommentItem = {
      id: `comment-${Date.now()}`,
      officer: 'คุณ',
      text: commentDraft.trim(),
      likes: 0,
      resolved: false,
    }

    setProperties((current) => current.map((item) => (item.id === selectedProperty.id ? { ...item, comments: [nextComment, ...item.comments] } : item)))
    setCommentDraft('')
    setActionMessage('ความคิดเห็นถูกแชร์กับทีมเรียบร้อยแล้ว')
  }

  const toggleLike = (commentId: string) => {
    if (!selectedProperty) return

    setProperties((current) => current.map((item) => (item.id === selectedProperty.id ? {
      ...item,
      comments: item.comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
    } : item)))
  }

  const toggleResolve = (commentId: string) => {
    if (!selectedProperty) return

    setProperties((current) => current.map((item) => (item.id === selectedProperty.id ? {
      ...item,
      comments: item.comments.map((comment) => (comment.id === commentId ? { ...comment, resolved: !comment.resolved } : comment)),
    } : item)))
  }

  const runAction = async (action: string) => {
    if (!selectedProperty) return

    switch (action) {
      case 'Copy GPS':
        await navigator.clipboard.writeText(`${selectedProperty.latitude.toFixed(4)}, ${selectedProperty.longitude.toFixed(4)}`)
        break
      case 'Copy Address':
        await navigator.clipboard.writeText(selectedProperty.address)
        break
      default:
        break
    }

    setActionMessage(`${action} สำเร็จสำหรับ ${selectedProperty.owner}`)
  }

  return (
    <Layout title="ข้อมูลกลางทรัพย์สินร่วมกัน">
      <div className={styles.shell}>
        <section className={styles.heroCard}>
          <div>
            <div className={styles.eyebrow}>ข้อมูลกลางทรัพย์สินร่วมกัน</div>
            <h1>ฐานความรู้ที่ใช้ร่วมกันสำหรับทุกเจ้าหน้าที่ประเมิน</h1>
            <p>ค้นหา นำกลับมาใช้ และอัปเดตทรัพย์สินที่บันทึกไว้จากพื้นที่ทำงานเดียวที่ออกแบบมาเพื่อการทำงานร่วมกัน</p>
          </div>
          <div className={styles.heroBadge}>
            <span>คะแนนความรู้</span>
            <strong>{selectedProperty?.knowledgeScore ?? 0}%</strong>
          </div>
        </section>

        <section className={styles.searchCard}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาจังหวัด อำเภอ ถนน หมู่บ้าน คอนโดมิเนียม เบอร์โทร ราคา เจ้าหน้าที่ วันที่"
            />
          </div>
          <div className={styles.filterRow}>
            {filterOptions.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`${styles.filterChip} ${activeFilters.includes(filter) ? styles.filterChipActive : ''}`}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.contentGrid}>
          <div className={styles.cardsColumn}>
            {filteredProperties.map((property) => (
              <button
                key={property.id}
                type="button"
                className={`${styles.propertyCard} ${selectedProperty?.id === property.id ? styles.propertyCardActive : ''}`}
                onClick={() => setSelectedId(property.id)}
              >
                <img src={property.images[0]} alt={property.owner} className={styles.cardImage} />
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <div>
                      <div className={styles.cardTitle}>{property.owner}</div>
                      <div className={styles.cardMeta}>{property.type || 'บ้านเดี่ยว'} • {property.province}</div>
                    </div>
                    <span className={styles.priceTag}>{formatCurrency(property.marketPrice)}</span>
                  </div>

                  <div className={styles.cardFacts}>
                    <span>{property.district}</span>
                    <span>{property.capturedBy}</span>
                    <span>{property.photoCount} ภาพ</span>
                    <span>{property.updateCount} ครั้งอัปเดต</span>
                  </div>

                  <div className={styles.cardBottom}>
                    <span>ความรู้ {property.knowledgeScore}%</span>
                    <span>{property.distanceKm} กม.</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedProperty && (
            <section className={styles.detailPanel}>
              <div className={styles.detailHero}>
                <img src={selectedProperty.images[0]} alt={selectedProperty.owner} className={styles.detailImage} />
                <div className={styles.detailOverlay}>
                  <span className={styles.statusPill}>{selectedProperty.statusLabel}</span>
                  <span className={styles.statusPillAccent}>{selectedProperty.type || 'บ้านเดี่ยว'}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>ข้อมูลทรัพย์สิน</div>
                <div className={styles.infoGrid}>
                  <div><span>ที่อยู่</span><strong>{selectedProperty.address}</strong></div>
                  <div><span>ราคาขาย</span><strong>{formatCurrency(selectedProperty.marketPrice)}</strong></div>
                  <div><span>จังหวัด</span><strong>{selectedProperty.province}</strong></div>
                  <div><span>เขต</span><strong>{selectedProperty.district}</strong></div>
                  <div><span>วันที่บันทึก</span><strong>{formatDate(selectedProperty.captureDate)}</strong></div>
                  <div><span>บันทึกโดย</span><strong>{selectedProperty.capturedBy}</strong></div>
                  <div><span>เบอร์โทร</span><strong>{selectedProperty.phoneNumbers[0]}</strong></div>
                  <div><span>คะแนนความรู้</span><strong>{selectedProperty.knowledgeScore}%</strong></div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>แกลเลอรีและพิกัด GPS</div>
                <div className={styles.galleryRow}>
                  {selectedProperty.images.map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`${selectedProperty.owner}-${index}`} className={styles.thumb} />
                  ))}
                </div>
                <div className={styles.mapCard}>
                  <div className={styles.mapBadge}>GPS</div>
                  <div>
                    <strong>{selectedProperty.latitude.toFixed(4)}, {selectedProperty.longitude.toFixed(4)}</strong>
                    <div className={styles.mapMeta}>{selectedProperty.condominium} • {selectedProperty.road}</div>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>รายละเอียดทรัพย์สิน</div>
                <div className={styles.infoGrid}>
                  <div><span>ประเภททรัพย์สิน</span><strong>{selectedProperty.type || 'บ้านเดี่ยว'}</strong></div>
                  <div><span>พื้นที่ดิน</span><strong>{selectedProperty.landArea}</strong></div>
                  <div><span>พื้นที่ใช้สอย</span><strong>{selectedProperty.usableArea}</strong></div>
                  <div><span>ชื่อโครงการ</span><strong>{selectedProperty.projectName}</strong></div>
                  <div><span>วันที่ตรวจสอบ</span><strong>{formatDate(selectedProperty.inspectionDate)}</strong></div>
                  <div><span>เจ้าหน้าที่</span><strong>{selectedProperty.capturedBy}</strong></div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>กิจกรรมทีม</div>
                <div className={styles.timelineList}>
                  {selectedProperty.history.map((entry, index) => (
                    <div key={`${entry.action}-${index}`} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div>
                        <div className={styles.timelineAction}>{entry.action}</div>
                        <div className={styles.timelineMeta}>{entry.officer} • {entry.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>ความคิดเห็น</div>
                <div className={styles.commentComposer}>
                  <textarea
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    rows={3}
                    placeholder="กล่าวถึงเจ้าหน้าที่และแบ่งปันบันทึก..."
                  />
                  <div className={styles.commentActions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => setCommentDraft('@Nina ')}>กล่าวถึงเจ้าหน้าที่</button>
                    <button type="button" className={styles.primaryButton} onClick={addComment}>โพสต์ความคิดเห็น</button>
                  </div>
                </div>
                <div className={styles.commentList}>
                  {selectedProperty.comments.map((comment) => (
                    <div key={comment.id} className={styles.commentCard}>
                      <div className={styles.commentHeader}>
                        <strong>{comment.officer}</strong>
                        <span className={comment.resolved ? styles.resolvedPill : styles.openPill}>{comment.resolved ? 'แก้ไขแล้ว' : 'กำลังดำเนินการ'}</span>
                      </div>
                      <div className={styles.commentText}>{comment.text}</div>
                      <div className={styles.commentActions}>
                        <button type="button" className={styles.secondaryButton} onClick={() => toggleLike(comment.id)}>ชอบ · {comment.likes}</button>
                        <button type="button" className={styles.secondaryButton} onClick={() => toggleResolve(comment.id)}>{comment.resolved ? 'เปิดใหม่' : 'แก้ไขแล้ว'}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.sectionTitle}>ปุ่มดำเนินการล่าง</div>
                <div className={styles.actionRow}>
                  <button type="button" className={styles.secondaryButton}>นำทาง</button>
                  <button type="button" className={styles.secondaryButton}>แชร์</button>
                  <button type="button" className={styles.secondaryButton} onClick={() => runAction('Copy GPS')}>คัดลอกพิกัด</button>
                  <button type="button" className={styles.secondaryButton} onClick={() => runAction('Copy Address')}>คัดลอกที่อยู่</button>
                  <button type="button" className={styles.secondaryButton}>ส่งออก</button>
                  <button type="button" className={styles.secondaryButton}>เพิ่มภาพ</button>
                  <button type="button" className={styles.secondaryButton}>แก้ไข</button>
                </div>
                {actionMessage ? <div className={styles.statusMessage}>{actionMessage}</div> : null}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  )
}
