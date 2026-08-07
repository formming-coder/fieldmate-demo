import React, { memo, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Property } from '../../types'

type TimelineEvent = {
  id: string
  title: string
  detail: string
  time: string
}

type PropertyInfoProps = {
  property: Property
  aiConfidence: number
  distanceKm: number
  statusLabel: string
}

const rowHeight = 54
const maxRows = 4

function PropertyInfo({ property, aiConfidence, distanceKm, statusLabel }: PropertyInfoProps) {
  const navigate = useNavigate()
  const timelineRef = useRef<HTMLDivElement | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [actionMessage, setActionMessage] = useState('')

  const timeline = useMemo<TimelineEvent[]>(() => [
    { id: 'event-1', title: 'ประวัติตรวจสอบ', detail: 'ตรวจสอบภาคสนามเสร็จสิ้น', time: '2026-08-07 09:20' },
    { id: 'event-2', title: 'ประวัติทบทวน', detail: 'ผู้ตรวจอาวุโสทบทวนแล้ว', time: '2026-08-07 10:45' },
    { id: 'event-3', title: 'อัปโหลดภาพ', detail: 'ซิงก์รูปภาพขึ้นคลาวด์แล้ว 4 ภาพ', time: '2026-08-07 11:10' },
    { id: 'event-4', title: 'การวิเคราะห์ AI', detail: 'ความมั่นใจมูลค่าปรับเพิ่มแล้ว', time: '2026-08-07 11:40' },
    { id: 'event-5', title: 'ประวัติตรวจสอบ', detail: 'เชื่อมโยงข้อมูลอ้างอิงย้อนหลังแล้ว', time: '2026-08-05 14:20' },
    { id: 'event-6', title: 'การวิเคราะห์ AI', detail: 'คำนวณความเสี่ยงน้ำท่วมใหม่แล้ว', time: '2026-08-04 18:30' },
  ], [])

  const visible = timeline.slice(startIndex, startIndex + maxRows)

  const onScrollTimeline = () => {
    const top = timelineRef.current?.scrollTop || 0
    const next = Math.min(Math.floor(top / rowHeight), Math.max(0, timeline.length - maxRows))
    if (next !== startIndex) setStartIndex(next)
  }

  return (
    <section className="smart-info">
      <div className="smart-info-head">
        <h2>{property.owner}</h2>
        <span className="smart-info-type">{property.type || 'ทรัพย์สิน'}</span>
      </div>
      <div className="smart-info-grid">
        <div><span>เจ้าของ</span><strong>{property.owner}</strong></div>
        <div><span>ความมั่นใจ AI</span><strong>{aiConfidence}%</strong></div>
        <div><span>ราคาประเมิน</span><strong>{property.marketPrice.toLocaleString()} บาท</strong></div>
        <div><span>ระยะทาง</span><strong>{distanceKm.toFixed(1)} กม.</strong></div>
        <div><span>ที่ตั้ง</span><strong>{property.province}</strong></div>
        <div><span>สถานะ</span><strong>{statusLabel}</strong></div>
        <div><span>เวลานัดหมาย</span><strong>{new Date(property.lastInspection).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</strong></div>
      </div>

      <div className="smart-info-actions">
        <button type="button" onClick={() => window.open(`https://www.google.com/maps?q=${property.latitude},${property.longitude}`, '_blank', 'noopener,noreferrer')}>เริ่มนำทาง</button>
        <button type="button" onClick={() => navigate('/camera')}>เปิดกล้อง</button>
        <button type="button" onClick={() => navigate('/ai-summary')}>สรุป AI</button>
        <button type="button" onClick={() => setActionMessage(`บันทึกรายการ ${property.owner} แล้ว`)}>บันทึก</button>
        <button
          type="button"
          onClick={async () => {
            const detail = `${property.owner} • ${property.province} • ${property.marketPrice.toLocaleString()} บาท`
            if (navigator.share) {
              try {
                await navigator.share({
                  title: 'ข้อมูลทรัพย์สินภาคสนาม',
                  text: detail,
                })
                setActionMessage('แชร์ข้อมูลสำเร็จ')
                return
              } catch {
                // If user cancels share, keep the UI silent.
              }
            }

            try {
              await navigator.clipboard.writeText(detail)
              setActionMessage('คัดลอกข้อมูลเพื่อแชร์แล้ว')
            } catch {
              setActionMessage('ไม่สามารถแชร์ได้ในขณะนี้')
            }
          }}
        >
          แชร์
        </button>
      </div>

      {actionMessage ? <p className="smart-info-note">{actionMessage}</p> : null}

      <div className="smart-timeline-wrap">
        <h3>ไทม์ไลน์</h3>
        <div className="smart-timeline" ref={timelineRef} onScroll={onScrollTimeline}>
          <div style={{ height: timeline.length * rowHeight, position: 'relative' }}>
            {visible.map((event, idx) => {
              const realIndex = startIndex + idx
              return (
                <div key={event.id} className="smart-timeline-item" style={{ top: realIndex * rowHeight }}>
                  <span className="dot" aria-hidden="true" />
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.detail}</p>
                  </div>
                  <time>{event.time}</time>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(PropertyInfo)
