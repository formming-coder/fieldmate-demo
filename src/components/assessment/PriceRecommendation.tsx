import React, { memo } from 'react'

type PriceRecommendationProps = {
  recommended: number
  min: number
  max: number
  suggested: number
  confidence: number
  reasoning: string
}

function PriceRecommendation({ recommended, min, max, suggested, confidence, reasoning }: PriceRecommendationProps) {
  return (
    <section className="as-card as-price-card">
      <h2>ราคาแนะนำ</h2>
      <div className="as-grid">
        <div><span>มูลค่าแนะนำโดย AI</span><strong>{recommended.toLocaleString()} บาท</strong></div>
        <div><span>ช่วงราคาตลาด</span><strong>{min.toLocaleString()} - {max.toLocaleString()} บาท</strong></div>
        <div><span>ราคาประเมินที่เสนอ</span><strong>{suggested.toLocaleString()} บาท</strong></div>
        <div><span>ความมั่นใจ</span><strong>{confidence}%</strong></div>
      </div>
      <p>{reasoning}</p>
    </section>
  )
}

export default memo(PriceRecommendation)
