import React, { memo } from 'react'

type WelcomeCardProps = {
  hours: string
  location: string
  weather: string
  summary: string
}

function WelcomeCard({ hours, location, weather, summary }: WelcomeCardProps) {
  return (
    <section className="db-card db-welcome-card">
      <div>
        <div className="db-eyebrow">ยินดีต้อนรับกลับ</div>
        <h2>สรุปประจำวัน</h2>
        <p>{summary}</p>
      </div>
      <div className="db-welcome-grid">
        <div><span>เวลาทำงาน</span><strong>{hours}</strong></div>
        <div><span>ตำแหน่ง</span><strong>{location}</strong></div>
        <div><span>สภาพอากาศ</span><strong>{weather}</strong></div>
      </div>
    </section>
  )
}

export default memo(WelcomeCard)
