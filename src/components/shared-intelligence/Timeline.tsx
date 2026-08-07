import React, { memo } from 'react'

export type TimelineEvent = {
  id: string
  stage: string
  officer: string
  date: string
  time: string
}

type TimelineProps = {
  items: TimelineEvent[]
}

function Timeline({ items }: TimelineProps) {
  return (
    <section className="spi-section">
      <div className="spi-section-title">ไทม์ไลน์</div>
      <div className="spi-timeline">
        {items.map((item) => (
          <div key={item.id} className="spi-timeline-item">
            <span className={`spi-timeline-dot is-${item.stage.toLowerCase()}`} />
            <div>
              <strong>{item.stage}</strong>
              <p>{item.officer}</p>
            </div>
            <time>{item.date} • {item.time}</time>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(Timeline)
