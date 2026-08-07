import React, { memo } from 'react'

type GISSummaryProps = {
  findings: string[]
  warnings: string[]
  recommendation: string
}

function GISSummary({ findings, warnings, recommendation }: GISSummaryProps) {
  return (
    <section className="gis-panel-card">
      <div className="gis-section-title">รายงานย่อ</div>
      <div className="gis-summary-block">
        <strong>ข้อค้นพบสำคัญ</strong>
        <ul>{findings.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="gis-summary-block">
        <strong>ข้อควรระวัง</strong>
        <ul>{warnings.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="gis-summary-reco">{recommendation}</div>
    </section>
  )
}

export default memo(GISSummary)
