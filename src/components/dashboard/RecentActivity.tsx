import React, { memo } from 'react'

type ActivityItem = {
  id: string
  title: string
  detail: string
  time: string
  tone: 'success' | 'warning' | 'neutral' | 'primary'
}

type RecentActivityProps = {
  items: ActivityItem[]
}

function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className="dashboard-section">
      <h2 className="dashboard-section-title">Recent Activities</h2>
      <div className="activity-list">
        {items.map((item) => (
          <div key={item.id} className="activity-item">
            <span className={`activity-dot activity-dot-${item.tone}`} aria-hidden="true" />
            <div>
              <div className="activity-title">{item.title}</div>
              <div className="activity-detail">{item.detail}</div>
            </div>
            <time className="activity-time">{item.time}</time>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(RecentActivity)
