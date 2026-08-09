import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import PropertyDetailContent from '../components/PropertyDetailContent'
import { BottomSheet } from '../components/ui'
import { useCurrentOfficerQuery, usePropertiesQuery } from '../hooks/useBackendQueries'
import { historyRepository } from '../repositories'
import '../components/PropertyDetailContent.css'
import '../pages/propertydetail.css'

type FollowUpState = {
  price: string
  phone: string
  notes: string
}

const defaultFollowUp: FollowUpState = {
  price: '',
  phone: '',
  notes: '',
}

function readFollowUp(propertyId: string) {
  if (typeof window === 'undefined') return defaultFollowUp
  try {
    const raw = window.localStorage.getItem(`fieldmate-followup:${propertyId}`)
    return raw ? { ...defaultFollowUp, ...(JSON.parse(raw) as FollowUpState) } : defaultFollowUp
  } catch {
    return defaultFollowUp
  }
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: properties = [] } = usePropertiesQuery()
  const { data: currentOfficer } = useCurrentOfficerQuery()
  const [toast, setToast] = useState('')
  const [history, setHistory] = useState<Array<{ id: string; action: string; createdAt: string; actor: string }>>([])
  const [followUp, setFollowUp] = useState<FollowUpState>(defaultFollowUp)

  const property = useMemo(() => properties.find((item) => item.id === id) || properties[0] || null, [properties, id])

  useEffect(() => {
    if (!property) return
    setFollowUp(readFollowUp(property.id))
    void historyRepository.list(property.id, 8).then(setHistory).catch(() => setHistory([]))
  }, [property])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const nearby = useMemo(() => {
    if (!property) return []
    return properties.filter((item) => item.id !== property.id && Math.abs(item.latitude - property.latitude) < 0.03).slice(0, 4)
  }, [properties, property])

  const saveFollowUp = () => {
    if (!property || typeof window === 'undefined') return
    window.localStorage.setItem(`fieldmate-followup:${property.id}`, JSON.stringify(followUp))
    void historyRepository.create({
      propertyId: property.id,
      action: 'อัปเดตข้อมูลภายหลัง',
      actor: currentOfficer?.name || 'Demo Officer',
    }).then(() => {
      void historyRepository.list(property.id, 8).then(setHistory).catch(() => setHistory([]))
    })
    setToast('บันทึกข้อมูลอัปเดตภายหลังแล้ว')
  }

  if (!property) {
    return (
      <Layout title="รายละเอียดทรัพย์สิน">
        <div className="detail-shell">
          <div className="detail-card">
            <p>ยังไม่พบข้อมูลทรัพย์สินที่เลือก</p>
            <button type="button" className="action-btn primary" onClick={() => navigate('/album')}>กลับไปรายการทรัพย์</button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="รายละเอียดทรัพย์สิน">
      <BottomSheet
        open
        mode="property"
        title="รายละเอียดทรัพย์สิน"
        onClose={() => navigate('/album', { replace: true })}
        footer={(
          <>
            <button type="button" onClick={() => navigate('/camera')}>บันทึกเพิ่ม</button>
            <button type="button" onClick={() => setToast('พร้อมกลับมาอัปเดตข้อมูลภายหลัง')}>อัปเดตภายหลัง</button>
            <button type="button" onClick={() => navigate('/album')}>รายการทรัพย์</button>
          </>
        )}
      >
        <PropertyDetailContent property={property} nearby={nearby} onSelectNearby={(item) => navigate(`/property/${item.id}`, { replace: true })} />

        <div className="detail-card">
          <div className="section-title">อัปเดตภายหลัง</div>
          <div className="follow-up-grid">
            <label>
              <span>ราคา</span>
              <input value={followUp.price} onChange={(event) => setFollowUp((current) => ({ ...current, price: event.target.value }))} placeholder="ราคาขายหรือราคาประเมิน" />
            </label>
            <label>
              <span>เบอร์โทร</span>
              <input value={followUp.phone} onChange={(event) => setFollowUp((current) => ({ ...current, phone: event.target.value }))} placeholder="เบอร์ผู้ขาย" />
            </label>
            <label className="full-width">
              <span>หมายเหตุ</span>
              <textarea value={followUp.notes} onChange={(event) => setFollowUp((current) => ({ ...current, notes: event.target.value }))} placeholder="รายละเอียดเพิ่มเติมภายหลัง" />
            </label>
          </div>
          <div className="detail-secondary-actions">
            <button type="button" className="action-btn primary" onClick={saveFollowUp}>บันทึกอัปเดต</button>
          </div>
        </div>

        <div className="detail-card">
          <div className="section-title">ประวัติ</div>
          <div className="timeline-list">
            {history.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <div style={{ fontWeight: 700 }}>{item.action}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12 }}>{item.actor} • {new Date(item.createdAt).toLocaleString('th-TH')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {toast ? <div className="detail-toast" role="status" aria-live="polite">{toast}</div> : null}
      </BottomSheet>
    </Layout>
  )
}
