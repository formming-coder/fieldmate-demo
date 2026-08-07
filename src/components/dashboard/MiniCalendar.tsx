import React, { memo } from 'react'

type MiniCalendarProps = {
  items: Array<{ time: string; title: string; type: string }>
}

function MiniCalendar({ items }: MiniCalendarProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">Mini Calendar</div>
      <h2>Today's Schedule</h2>
      <div className="db-schedule-list">
        {items.map((item) => (
          <div key={`${item.time}-${item.title}`} className="db-schedule-item">
            <strong>{item.time}</strong>
            <div>
              <span>{item.title}</span>
              <em>{item.type}</em>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(MiniCalendar)
