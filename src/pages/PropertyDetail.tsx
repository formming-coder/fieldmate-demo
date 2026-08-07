import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { fetchProperties } from '../api/mockApi'
import { Property } from '../types'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './propertydetail.css'

const historySeed = [
  { officer: 'Nina', date: '2026-08-05', time: '14:20', action: 'เพิ่มภาพถ่าย' },
  { officer: 'Korn', date: '2026-08-02', time: '09:15', action: 'อัปเดตราคา' },
  { officer: 'Mali', date: '2026-07-31', time: '16:50', action: 'ย้ายพิกัด GPS' },
  { officer: 'Pong', date: '2026-07-28', time: '11:10', action: 'เพิ่มเบอร์โทร' },
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

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [nearby, setNearby] = useState<Property[]>([])

  useEffect(() => {
    let mounted = true
    fetchProperties().then(list => {
      if (!mounted) return
      const found = list.find(item => item.id === id) || list[0]
      setProperty(found)
      const related = list.filter(item => item.id !== found.id && Math.abs(item.latitude - found.latitude) < 0.03).slice(0, 4)
      setNearby(related)
    })
    return () => { mounted = false }
  }, [id])

  const propertyType = useMemo(() => getPropertyType(property?.type), [property])

  if (!property) {
    return (
      <Layout title="รายละเอียดทรัพย์สิน">
        <div className="detail-shell">
          <div className="detail-card">กำลังโหลด...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="รายละเอียดทรัพย์สิน">
      <div className="detail-shell">
        <div className="detail-card hero-card">
          <img className="hero-image" src={property.images[0]} alt={property.owner} />
          <div className="hero-overlay">
            <span className="pill">{propertyType}</span>
            <span className="pill accent">THB {property.marketPrice.toLocaleString()}</span>
          </div>
          <div className="hero-meta">
            <div style={{ fontWeight: 800 }}>{property.owner}</div>
            <div style={{ color: 'var(--muted)' }}>{property.province} • ความแม่นยำ GPS 4.8m</div>
          </div>
        </div>

        <div className="detail-card">
          <div className="section-title">ข้อมูลทรัพย์สิน</div>
          <div className="info-grid">
            <div><span>ประเภททรัพย์สิน</span><strong>{propertyType}</strong></div>
            <div><span>พื้นที่ดิน</span><strong>12 ไร่ / 3 งาน</strong></div>
            <div><span>พื้นที่ใช้สอย</span><strong>245 ตร.ม.</strong></div>
            <div><span>จำนวนชั้น</span><strong>2</strong></div>
            <div><span>ชื่อโครงการ</span><strong>River Crest</strong></div>
            <div><span>อาคาร</span><strong>อาคาร B</strong></div>
            <div><span>ชั้น</span><strong>3</strong></div>
            <div><span>ที่อยู่</span><strong>123/4 ซอย 6 ถนนพระราม 9</strong></div>
            <div><span>พิกัด GPS</span><strong>{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</strong></div>
            <div><span>วันที่ตรวจสอบ</span><strong>{new Date(property.lastInspection).toLocaleDateString('th-TH')}</strong></div>
            <div><span>เจ้าหน้าที่</span><strong>นีนา</strong></div>
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
          <div className="section-title">ทรัพย์สินใกล้เคียง</div>
          <div className="nearby-list">
            {nearby.map(item => (
              <button key={item.id} className="nearby-item" onClick={() => navigate(`/property/${item.id}`)}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.owner}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>{item.province}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>THB {item.marketPrice.toLocaleString()}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>2.1 km</div>
                </div>
              </button>
            ))}
          </div>
        </div>

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
      </div>

      <div className="bottom-actions">
        <button className="action-btn">นำทาง</button>
        <button className="action-btn">แชร์</button>
        <button className="action-btn">เพิ่มภาพ</button>
        <button className="action-btn">แก้ไข</button>
        <button className="action-btn primary">บันทึก</button>
      </div>
    </Layout>
  )
}
