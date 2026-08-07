import React, { memo } from 'react'

type AIRecommendationProps = {
  recommendation: string
  nearbyTasks: string
  riskAlert: string
  route: string
  travelTime: string
}

function AIRecommendation({ recommendation, nearbyTasks, riskAlert, route, travelTime }: AIRecommendationProps) {
  return (
    <section className="db-card db-ai-card">
      <div className="db-eyebrow">ผู้ช่วย AI</div>
      <h2>คำแนะนำสำหรับวันนี้</h2>
      <p>{recommendation}</p>
      <div className="db-info-list">
        <div><span>งานใกล้เคียง</span><strong>{nearbyTasks}</strong></div>
        <div><span>การแจ้งเตือนความเสี่ยง</span><strong>{riskAlert}</strong></div>
        <div><span>เส้นทางที่แนะนำ</span><strong>{route}</strong></div>
        <div><span>เวลาเดินทางโดยประมาณ</span><strong>{travelTime}</strong></div>
      </div>
    </section>
  )
}

export default memo(AIRecommendation)
