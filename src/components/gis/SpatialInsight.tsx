import React, { memo } from 'react'

type SpatialInsightProps = {
  riskScore: number
  text: string[]
}

function SpatialInsight({ riskScore, text }: SpatialInsightProps) {
  return (
    <section className="gis-panel-card">
      <div className="gis-section-title">AI Spatial Insight</div>
      <div className="gis-insight-score">Risk Score {riskScore}</div>
      <ul className="gis-insight-list">
        {text.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  )
}

export default memo(SpatialInsight)
