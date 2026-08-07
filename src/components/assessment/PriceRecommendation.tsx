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
      <h2>Price Recommendation</h2>
      <div className="as-grid">
        <div><span>AI Recommended Value</span><strong>THB {recommended.toLocaleString()}</strong></div>
        <div><span>Market Range</span><strong>THB {min.toLocaleString()} - {max.toLocaleString()}</strong></div>
        <div><span>Suggested Appraisal</span><strong>THB {suggested.toLocaleString()}</strong></div>
        <div><span>Confidence</span><strong>{confidence}%</strong></div>
      </div>
      <p>{reasoning}</p>
    </section>
  )
}

export default memo(PriceRecommendation)
