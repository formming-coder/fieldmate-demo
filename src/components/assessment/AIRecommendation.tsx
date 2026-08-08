import React, { memo } from 'react'

function AIRecommendation({ recommendation }: { recommendation: string }) {
  return (
    <section className="as-card">
      <h2>คำแนะนำจาก AI</h2>
      <p className="aa-recommendation-copy">{recommendation}</p>
    </section>
  )
}

export default memo(AIRecommendation)
