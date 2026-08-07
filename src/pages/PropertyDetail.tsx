import React, { useMemo } from 'react'
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
  const property = useMemo(() => properties.find((item) => item.id === id) || properties[0] || null, [properties, id])
  const nearby = useMemo(() => {
    if (!property) return []
    return properties.filter((item) => item.id !== property.id && Math.abs(item.latitude - property.latitude) < 0.03).slice(0, 4)
  }, [properties, property])

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
      <div {...swipeBack}>
        <BottomSheet open onClose={() => navigate(-1)} snapPoints={[0.54, 0.84, 0.96]} initialSnap={1}>
          <PropertyDetailContent property={property} nearby={nearby} onSelectNearby={(item) => navigate(`/property/${item.id}`)} />

          <div className="bottom-actions">
            <button className="action-btn">นำทาง</button>
            <button className="action-btn">แชร์</button>
            <button className="action-btn">เพิ่มภาพ</button>
            <button className="action-btn">แก้ไข</button>
            <button className="action-btn primary">บันทึก</button>
          </div>
        </BottomSheet>
      </div>
    </Layout>
  )
}
