import React, { useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { Property } from '../types'
import './PropertyDetailContent.css'

const historySeed = [
  { officer: 'นีนา', date: '2026-08-05', time: '14:20', action: 'เพิ่มภาพถ่าย' },
  { officer: 'กร', date: '2026-08-02', time: '09:15', action: 'อัปเดตราคา' },
  { officer: 'มะลิ', date: '2026-07-31', time: '16:50', action: 'ย้ายพิกัด GPS' },
  { officer: 'พงศ์', date: '2026-07-28', time: '11:10', action: 'เพิ่มเบอร์โทร' },
]

function getPropertyType(type?: string) {
  if (!type) return 'บ้านเดี่ยว'
  const lower = type.toLowerCase()
  if (lower.includes('land')) return 'ที่ดินว่าง'
  if (lower.includes('house')) return 'บ้านเดี่ยว'
  if (lower.includes('twin') || lower.includes('semi')) return 'ทาวน์เฮาส์คู่'
  if (lower.includes('town')) return 'ทาวน์เฮาส์'
  if (lower.includes('commercial')) return 'อาคารพาณิชย์'
  if (lower.includes('condo') || lower.includes('condominium')) return 'คอนโดมิเนียม'
  return type
}

export type PropertyDetailContentProps = {
  property: Property
  nearby?: Property[]
  onSelectNearby?: (property: Property) => void
  compact?: boolean
}

export default function PropertyDetailContent({ property, nearby = [], onSelectNearby, compact = false }: PropertyDetailContentProps) {
  const propertyType = useMemo(() => getPropertyType(property?.type), [property])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  const galleryImages = property.images.length ? property.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80']
  const activeImage = galleryImages[galleryIndex] || galleryImages[0]

  const nextImage = () => setGalleryIndex((current) => (current + 1) % galleryImages.length)
  const previousImage = () => setGalleryIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)

  return (
    <div className={`detail-shell ${compact ? 'detail-shell-compact' : ''}`}>
      <div className="detail-card hero-card">
        <img className="hero-image" src={activeImage} alt={property.owner} style={{ transform: `scale(${zoom})` }} />
        <div className="hero-overlay">
          <span className="pill">{propertyType}</span>
          <span className="pill accent">{property.marketPrice.toLocaleString()} บาท</span>
        </div>
        <div className="hero-meta">
          <div style={{ fontWeight: 800 }}>{property.owner}</div>
          <div style={{ color: 'var(--muted)' }}>{property.province} • ความแม่นยำ GPS 4.8 ม.</div>
          <div className="gallery-row" style={{ marginTop: 8 }}>
            <button type="button" className="chip" onClick={previousImage}>ก่อนหน้า</button>
            <button type="button" className="chip" onClick={nextImage}>ถัดไป</button>
            <button type="button" className="chip" onClick={() => setFullscreen(true)}>เต็มจอ</button>
            <input type="range" min={1} max={2.5} step={0.1} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="ปรับการซูมภาพ" />
          </div>
        </div>
      </div>

      <div className="detail-card">
        <div className="section-title">ข้อมูลทรัพย์สิน</div>
        <div className="info-grid">
          <div><span>ประเภททรัพย์สิน</span><strong>{propertyType}</strong></div>
          <div><span>พื้นที่</span><strong>{property.areaSqm.toLocaleString('th-TH')} ตร.ม.</strong></div>
          <div><span>จำนวนชั้น</span><strong>2</strong></div>
          <div><span>ชื่อโครงการ</span><strong>ริเวอร์ เครสต์</strong></div>
          <div><span>อาคาร</span><strong>อาคาร B</strong></div>
          <div><span>ชั้น</span><strong>3</strong></div>
          <div><span>ที่อยู่</span><strong>{property.address}</strong></div>
          <div><span>พิกัด GPS</span><strong>{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</strong></div>
          <div><span>วันที่ตรวจสอบ</span><strong>{new Date(property.lastInspection).toLocaleDateString('th-TH')}</strong></div>
          <div><span>เจ้าหน้าที่</span><strong>นีนา</strong></div>
          <div><span>เจ้าของ</span><strong>{property.owner}</strong></div>
        </div>
      </div>

      <div className="detail-card">
        <div className="section-title">แผนที่ตัวอย่าง</div>
        <div className="mini-map">
          <MapContainer center={[property.latitude, property.longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[property.latitude, property.longitude]} icon={L.divIcon({ className: 'detail-marker' })} />
          </MapContainer>
        </div>
      </div>

      <div className="detail-card">
        <div className="section-title">แกลเลอรีภาพ</div>
        <div className="gallery-row">
          {property.images.map((img, idx) => (
            <img key={`${img}-${idx}`} className="thumb" src={img} alt={`${property.owner}-${idx}`} />
          ))}
        </div>
      </div>

      <div className="detail-card">
        <div className="section-title">สรุป AI</div>
        <div className="ai-summary-card">
          <div><span>ความเสี่ยง</span><strong>ปานกลางด้านสภาพจราจรและเสียงรบกวน</strong></div>
          <div><span>คำแนะนำ</span><strong>เก็บภาพด้านหลังเพิ่ม 2 มุม และตรวจเอกสารสิทธิ์ซ้ำ</strong></div>
          <div><span>ทรัพย์เปรียบเทียบเด่น</span><strong>ช่วงราคาใกล้เคียง {(property.marketPrice - 160000).toLocaleString()} บาท</strong></div>
          <div><span>ความเชื่อมั่น</span><strong>92%</strong></div>
          <div><span>ราคาแนะนำโดย AI</span><strong>{(property.marketPrice * 0.97).toLocaleString()} บาท</strong></div>
        </div>
      </div>

      <div className="detail-card">
        <div className="section-title">ทรัพย์เปรียบเทียบ</div>
        <div className="comparable-list">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="comparable-item">
              <div>
                <strong>โครงการใกล้เคียง {idx}</strong>
                <span>ระยะ {idx + 0.8} กม.</span>
              </div>
              <strong>{(property.marketPrice - idx * 180000).toLocaleString()} บาท</strong>
            </div>
          ))}
        </div>
      </div>

      {nearby.length ? (
        <div className="detail-card">
          <div className="section-title">ทรัพย์สินใกล้เคียง</div>
          <div className="nearby-list">
            {nearby.map((item) => (
              <button key={item.id} className="nearby-item" onClick={() => onSelectNearby?.(item)}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.owner}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>{item.province}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{item.marketPrice.toLocaleString()} บาท</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>2.1 กม.</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!compact ? (
        <>
          <div className="detail-card">
            <div className="section-title">ประวัติรุ่น</div>
            <div className="timeline-list">
              {historySeed.map((entry, idx) => (
                <div key={`${entry.action}-${idx}`} className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div style={{ fontWeight: 700 }}>{entry.action}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{entry.officer} • {entry.date} {entry.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <div className="section-title">การทำงานร่วมกัน</div>
            <div className="chip-row">
              <span className="chip">แสดงความคิดเห็น</span>
              <span className="chip">กล่าวถึงทีม</span>
              <span className="chip">ชื่นชอบ</span>
              <span className="chip">คัดลอกลิงก์</span>
            </div>
            <div className="timeline-list" style={{ marginTop: 10 }}>
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <div style={{ fontWeight: 700 }}>ความเห็นทีมประเมิน</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>แนะนำเก็บภาพแนวเขตด้านทิศตะวันตกเพิ่มเติม</div>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <div style={{ fontWeight: 700 }}>หมายเหตุเจ้าหน้าที่พื้นที่</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>ทางเข้าออกใช้งานได้ดี แต่ช่วงเช้าการจราจรหนาแน่น</div>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="section-title">ผลกระทบทางความรู้</div>
            <div className="stats-grid">
              <div><span>จำนวนการใช้ซ้ำ</span><strong>24</strong></div>
              <div><span>ดูล่าสุด</span><strong>2 ชั่วโมงที่แล้ว</strong></div>
              <div><span>ภาพถ่าย</span><strong>8</strong></div>
              <div><span>คุณภาพข้อมูล</span><strong>94%</strong></div>
            </div>
          </div>
        </>
      ) : null}

      {fullscreen ? (
        <div className="detail-fullscreen" role="dialog" aria-modal="true">
          <button type="button" className="chip" onClick={() => setFullscreen(false)}>ปิด</button>
          <img className="detail-fullscreen-image" src={activeImage} alt={property.owner} style={{ transform: `scale(${zoom})` }} />
        </div>
      ) : null}
    </div>
  )
}
