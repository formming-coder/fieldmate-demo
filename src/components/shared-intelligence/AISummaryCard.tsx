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
      <div className="spi-section-title">สรุปผลจาก AI</div>
      <div className="spi-ai-grid">
        <div><span>ประเภทที่ตรวจพบ</span><strong>{propertyType}</strong></div>
        <div><span>ความมั่นใจ</span><strong>{confidence}%</strong></div>
        <div><span>สรุป OCR</span><strong>{ocrSummary}</strong></div>
        <div><span>มุมมองตลาด</span><strong>{marketInsight}</strong></div>
        <div><span>ทรัพย์เปรียบเทียบที่แนะนำ</span><strong>{comparable}</strong></div>
        <div><span>ความเสี่ยง</span><strong>{risk}</strong></div>
      </div>
    </section>
  )
}

export default memo(AISummaryCard)
