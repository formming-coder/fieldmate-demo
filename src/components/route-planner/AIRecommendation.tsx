import React, { memo } from 'react'

type AIRecommendationProps = {
  items: string[]
}

function AIRecommendation({ items }: AIRecommendationProps) {
  return (
    <section className="rp-card">
      <div className="rp-eyebrow">AI Suggestions</div>
      <h2>Optimization insights</h2>
      <ul className="rp-bullet-list">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  )
}

export default memo(AIRecommendation)
