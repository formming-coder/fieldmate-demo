import React, { memo } from 'react'

type RiskDashboardProps = {
  items: Array<{ key: string; score: number }>
}

function RiskDashboard({ items }: RiskDashboardProps) {
  return (
    <section className="gis-panel-card">
      <div className="gis-section-title">แผงความเสี่ยง</div>
      <div className="gis-risk-list">
        {items.map((item) => (
          <div key={item.key} className="gis-risk-item">
            <span>{item.key}</span>
            <div className="gis-risk-bar"><i style={{ width: `${item.score}%` }} /></div>
            <strong>{item.score}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(RiskDashboard)
