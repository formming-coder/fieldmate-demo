import React, { memo } from 'react'

type AIRecommendationProps = {
  items: string[]
}

function AIRecommendation({ items }: AIRecommendationProps) {
  return (
    <section className="as-card">
      <h2>คำแนะนำจาก AI</h2>
      <ul className="as-recommend-list">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  )
}

export default memo(AIRecommendation)
