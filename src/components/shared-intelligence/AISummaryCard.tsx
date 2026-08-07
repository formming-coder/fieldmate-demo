import React, { memo } from 'react'

type AISummaryCardProps = {
  propertyType: string
  ocrSummary: string
  marketInsight: string
  comparable: string
  risk: string
  confidence: number
}

function AISummaryCard({ propertyType, ocrSummary, marketInsight, comparable, risk, confidence }: AISummaryCardProps) {
  return (
    <section className="spi-section">
      <div className="spi-section-title">AI Summary</div>
      <div className="spi-ai-grid">
        <div><span>Detected Type</span><strong>{propertyType}</strong></div>
        <div><span>Confidence</span><strong>{confidence}%</strong></div>
        <div><span>OCR Summary</span><strong>{ocrSummary}</strong></div>
        <div><span>Market Insight</span><strong>{marketInsight}</strong></div>
        <div><span>Suggested Comparable</span><strong>{comparable}</strong></div>
        <div><span>Risk</span><strong>{risk}</strong></div>
      </div>
    </section>
  )
}

export default memo(AISummaryCard)
