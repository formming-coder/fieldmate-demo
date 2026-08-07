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
      <div className="db-eyebrow">Notification Center</div>
      <h2>Alert distribution</h2>
      <div className="db-stat-grid">
        <div><span>Unread</span><strong>{unread}</strong></div>
        <div><span>Priority</span><strong>{priority}</strong></div>
        <div><span>AI Alerts</span><strong>{aiAlerts}</strong></div>
        <div><span>Market Alerts</span><strong>{marketAlerts}</strong></div>
        <div><span>Forest Alerts</span><strong>{forestAlerts}</strong></div>
        <div><span>Flood Alerts</span><strong>{floodAlerts}</strong></div>
      </div>
    </section>
  )
}

export default memo(NotificationCard)
