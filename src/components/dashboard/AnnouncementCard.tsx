import React, { memo } from 'react'

type Announcement = {
  id: string
  title: string
  body: string
}

type AnnouncementCardProps = {
  items: Announcement[]
}

function AnnouncementCard({ items }: AnnouncementCardProps) {
  return (
    <section className="dashboard-card announcement-card">
      <h2 className="dashboard-section-title">Announcement</h2>
      <div className="announcement-list">
        {items.map((item) => (
          <article key={item.id} className="announcement-item">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default memo(AnnouncementCard)
