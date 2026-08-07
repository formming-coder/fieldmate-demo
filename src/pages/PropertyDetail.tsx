import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import PropertyDetailContent from '../components/PropertyDetailContent'
import { BottomSheet } from '../components/ui'
import { useSwipeBack } from '../hooks/useSwipeBack'
import { usePropertiesQuery } from '../hooks/useBackendQueries'
import 'leaflet/dist/leaflet.css'
import '../components/PropertyDetailContent.css'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: properties = [] } = usePropertiesQuery()
  const swipeBack = useSwipeBack(() => navigate(-1))
  const [toast, setToast] = useState('')
  const property = useMemo(() => properties.find((item) => item.id === id) || properties[0] || null, [properties, id])
  const nearby = useMemo(() => {
    if (!property) return []
    return properties.filter((item) => item.id !== property.id && Math.abs(item.latitude - property.latitude) < 0.03).slice(0, 4)
  }, [properties, property])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openNavigation = () => {
    if (!property) return
    window.open(`https://www.google.com/maps?q=${property.latitude},${property.longitude}`, '_blank', 'noopener,noreferrer')
  }

  const shareProperty = async () => {
    if (!property) return

    const detail = `${property.owner} • ${property.province} • ${property.marketPrice.toLocaleString()} บาท`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'รายละเอียดทรัพย์สิน', text: detail })
        setToast('แชร์ข้อมูลสำเร็จ')
        return
      } catch {
        // Fall back to clipboard when share sheet is cancelled or unavailable.
      }
    }

    try {
      await navigator.clipboard.writeText(detail)
      setToast('คัดลอกข้อมูลเพื่อแชร์แล้ว')
    } catch {
      setToast('ไม่สามารถแชร์ได้ในขณะนี้')
    }
  }

  if (!property) {
    return (
      <Layout title="รายละเอียดทรัพย์สิน">
        <div className="detail-shell">
          <div className="detail-card">
            <p>ยังไม่พบข้อมูลทรัพย์สินที่เลือก</p>
            <button type="button" className="action-btn primary" onClick={() => navigate('/map')}>กลับไปแผนที่อัจฉริยะ</button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="รายละเอียดทรัพย์สิน">
      <div {...swipeBack}>
        <BottomSheet open onClose={() => navigate(-1)} snapPoints={[0.54, 0.84, 0.96]} initialSnap={1}>
          <PropertyDetailContent property={property} nearby={nearby} onSelectNearby={(item) => navigate(`/property/${item.id}`)} />

          <div className="bottom-actions">
            <button type="button" className="action-btn" onClick={openNavigation}>นำทาง</button>
            <button type="button" className="action-btn" onClick={() => void shareProperty()}>แชร์</button>
            <button type="button" className="action-btn" onClick={() => navigate('/camera')}>เพิ่มภาพ</button>
            <button type="button" className="action-btn" onClick={() => navigate('/assessment')}>แก้ไข</button>
            <button type="button" className="action-btn primary" onClick={() => setToast('บันทึกข้อมูลทรัพย์สินเรียบร้อยแล้ว')}>บันทึก</button>
          </div>

          {toast ? <div className="detail-toast" role="status" aria-live="polite">{toast}</div> : null}
        </BottomSheet>
      </div>
    </Layout>
  )
}
