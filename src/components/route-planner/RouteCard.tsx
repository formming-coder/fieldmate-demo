import React, { memo } from 'react'

type RouteCardProps = {
  title: string
  startLocation: string
  currentGps: string
  finishTime: string
  stopCount: number
}

function RouteCard({ title, startLocation, currentGps, finishTime, stopCount }: RouteCardProps) {
  return (
    <section className="rp-card rp-route-card">
      <div>
        <div className="rp-eyebrow">วางแผนเส้นทาง</div>
        <h2>{title}</h2>
      </div>
      <div className="rp-info-list">
        <div><span>จุดเริ่มต้น</span><strong>{startLocation}</strong></div>
        <div><span>พิกัด GPS ปัจจุบัน</span><strong>{currentGps}</strong></div>
        <div><span>รายการจุดหมาย</span><strong>{stopCount} จุด</strong></div>
        <div><span>เวลาเสร็จโดยประมาณ</span><strong>{finishTime}</strong></div>
      </div>
    </section>
  )
}

export default memo(RouteCard)
