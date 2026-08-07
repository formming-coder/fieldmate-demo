import React, { memo } from 'react'

type RiskItem = {
  key: string
  score: number
}

type RiskAssessmentProps = {
  items: RiskItem[]
}

function level(score: number) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

function RiskAssessment({ items }: RiskAssessmentProps) {
  const avg = Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length)

  return (
    <section className="as-card">
      <h2>Risk Assessment</h2>
      <div className="as-scoreline">
        <strong>{avg}</strong>
        <span>{level(avg)}</span>
      </div>
      <div className="as-risk-list">
        {items.map((item) => (
          <div key={item.key}>
            <span>{item.key}</span>
            <div className="as-risk-bar"><i style={{ width: `${item.score}%` }} /></div>
            <strong>{item.score}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(RiskAssessment)
