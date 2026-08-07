import React, { memo } from 'react'

type LegendCardProps = {
  title: string
  items: Array<{ label: string; color: string }>
}

function LegendCard({ title, items }: LegendCardProps) {
  return (
    <section className="gis-legend-card">
      <div className="gis-section-title">{title}</div>
      <div className="gis-legend-list">
        {items.map((item) => (
          <div key={item.label} className="gis-legend-item">
            <span style={{ background: item.color }} />
            <strong>{item.label}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(LegendCard)
