import React, { memo } from 'react'

type TravelAnalyticsProps = {
  distance: string
  drivingTime: string
  idleTime: string
  inspectionTime: string
  fuelEstimate: string
  carbonSaving: string
}

function TravelAnalytics({ distance, drivingTime, idleTime, inspectionTime, fuelEstimate, carbonSaving }: TravelAnalyticsProps) {
  return (
    <section className="rp-card">
      <div className="rp-eyebrow">วิเคราะห์การเดินทาง</div>
      <h2>สรุปองค์ประกอบการเดินทาง</h2>
      <div className="rp-info-grid">
        <div><span>ระยะทาง</span><strong>{distance}</strong></div>
        <div><span>เวลาเดินทาง</span><strong>{drivingTime}</strong></div>
        <div><span>เวลาหยุดรอ</span><strong>{idleTime}</strong></div>
        <div><span>เวลาตรวจสอบ</span><strong>{inspectionTime}</strong></div>
        <div><span>ค่าน้ำมันโดยประมาณ</span><strong>{fuelEstimate}</strong></div>
        <div><span>การลดคาร์บอน</span><strong>{carbonSaving}</strong></div>
      </div>
    </section>
  )
}

export default memo(TravelAnalytics)
