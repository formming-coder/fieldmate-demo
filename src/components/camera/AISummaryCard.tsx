import React, { memo } from 'react'
import { motion } from 'framer-motion'

type AISummaryCardProps = {
  propertyType: string
  condition: string
  risk: string
  comments: string
  completeness: number
  confidence: number
}

function AISummaryCard({ propertyType, condition, risk, comments, completeness, confidence }: AISummaryCardProps) {
  return (
    <section className="cam-ai-summary">
      <div className="cam-section-title-row">
        <h3>สรุปผล AI</h3>
        <span className="cam-score">{confidence}%</span>
      </div>
      <div className="cam-ai-thinking" aria-hidden="true">
        <motion.i animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
        <motion.i animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.15 }} />
        <motion.i animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
      </div>
      <div className="cam-confidence-track">
        <motion.div className="cam-confidence-fill" initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      </div>
      <div className="cam-ai-grid">
        <div><span>ประเภทที่ตรวจพบ</span><strong>{propertyType}</strong></div>
        <div><span>สภาพโดยรวม</span><strong>{condition}</strong></div>
        <div><span>ความเสี่ยง</span><strong>{risk}</strong></div>
        <div><span>ความครบถ้วน</span><strong>{completeness}%</strong></div>
      </div>
      <p>{comments}</p>
    </section>
  )
}

export default memo(AISummaryCard)
