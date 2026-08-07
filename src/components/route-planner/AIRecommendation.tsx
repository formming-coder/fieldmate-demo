import React, { memo } from 'react'

type AIRecommendationProps = {
  items: string[]
}

function AIRecommendation({ items }: AIRecommendationProps) {
  return (
    <section className="rp-card">
      <div className="rp-eyebrow">คำแนะนำ AI</div>
      <h2>ข้อมูลเชิงลึกเพื่อปรับเส้นทาง</h2>
      <ul className="rp-bullet-list">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  )
}

export default memo(AIRecommendation)
