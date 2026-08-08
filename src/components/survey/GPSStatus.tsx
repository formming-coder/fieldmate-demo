import React from 'react'
import { Property, SurveyLocation } from '../../types'

type GPSStatusProps = {
  property: Property
  location: SurveyLocation | null
  distanceMeters: number | null
  error: string
  loading: boolean
  onRetry: () => void
  onConfirm: () => void
}

export default function GPSStatus({ property, location, distanceMeters, error, loading, onRetry, onConfirm }: GPSStatusProps) {
  const nearby = distanceMeters !== null && distanceMeters <= 200

  return (
    <section className="survey-card survey-gps-card">
      <div className="survey-card-heading">
        <span className="material-symbols-rounded" aria-hidden="true">my_location</span>
        <div><h2>ตรวจสอบตำแหน่ง GPS</h2><p>ยืนยันว่าคุณอยู่ ณ ทรัพย์ที่สำรวจ</p></div>
      </div>

      <div className="survey-data-list">
        <div><span>ตำแหน่งทรัพย์</span><strong>{property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}</strong></div>
        <div><span>ตำแหน่งปัจจุบัน</span><strong>{location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'กำลังค้นหา...'}</strong></div>
        <div><span>ระยะห่าง</span><strong>{distanceMeters === null ? '-' : distanceMeters < 1000 ? `${Math.round(distanceMeters)} เมตร` : `${(distanceMeters / 1000).toFixed(1)} กม.`}</strong></div>
        <div><span>ความแม่นยำ GPS</span><strong>{location ? `${location.accuracy.toFixed(1)} เมตร` : '-'}</strong></div>
      </div>

      {error ? <div className="survey-inline-error" role="alert">{error}</div> : null}
      {location ? (
        <div className={`survey-gps-state ${nearby ? 'is-ready' : 'is-far'}`}>
          <span className="material-symbols-rounded" aria-hidden="true">{nearby ? 'check_circle' : 'distance'}</span>
          <div><strong>{nearby ? 'พร้อมสำรวจ' : 'อยู่นอกพื้นที่ทรัพย์'}</strong><small>{nearby ? 'ตำแหน่งอยู่ในรัศมี 200 เมตร' : 'ยังยืนยันได้ แต่ควรตรวจสอบตำแหน่งอีกครั้ง'}</small></div>
        </div>
      ) : null}

      <div className="survey-action-row">
        <button type="button" className="survey-button secondary" onClick={onRetry} disabled={loading}>{loading ? 'กำลังค้นหา...' : 'ค้นหา GPS อีกครั้ง'}</button>
        <button type="button" className="survey-button primary" onClick={onConfirm} disabled={!location || location.confirmed}>ยืนยันตำแหน่ง</button>
      </div>
    </section>
  )
}