import React, { memo } from 'react'

type TripSummaryProps = {
  properties: number
  distanceKm: number
  estimatedTime: string
  fuelCost: number
  efficiency: number
}

function TripSummary({ properties, distanceKm, estimatedTime, fuelCost, efficiency }: TripSummaryProps) {
  return (
    <section className="rp-card rp-summary-card">
      <div>
        <div className="rp-eyebrow">งานตรวจสอบวันนี้</div>
        <h2>{properties} รายการ</h2>
      </div>
      <div className="rp-summary-grid">
        <div><span>ระยะทาง</span><strong>{distanceKm} กม.</strong></div>
        <div><span>เวลาโดยประมาณ</span><strong>{estimatedTime}</strong></div>
        <div><span>ค่าน้ำมัน</span><strong>{fuelCost} บาท</strong></div>
        <div><span>ประสิทธิภาพ AI</span><strong>{efficiency}%</strong></div>
      </div>
    </section>
  )
}

export default memo(TripSummary)
