import React, { memo } from 'react'

type NotificationCardProps = {
  unread: number
  priority: string
  aiAlerts: number
  marketAlerts: number
  forestAlerts: number
  floodAlerts: number
}

function NotificationCard({ unread, priority, aiAlerts, marketAlerts, forestAlerts, floodAlerts }: NotificationCardProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">ศูนย์การแจ้งเตือน</div>
      <h2>สรุปการแจ้งเตือน</h2>
      <div className="db-stat-grid">
        <div><span>ยังไม่อ่าน</span><strong>{unread}</strong></div>
        <div><span>ความสำคัญ</span><strong>{priority}</strong></div>
        <div><span>AI แจ้งเตือน</span><strong>{aiAlerts}</strong></div>
        <div><span>ตลาดแจ้งเตือน</span><strong>{marketAlerts}</strong></div>
        <div><span>ป่าแจ้งเตือน</span><strong>{forestAlerts}</strong></div>
        <div><span>น้ำท่วมแจ้งเตือน</span><strong>{floodAlerts}</strong></div>
      </div>
    </section>
  )
}

export default memo(NotificationCard)
