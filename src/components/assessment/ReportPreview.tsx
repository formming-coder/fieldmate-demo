import React, { memo } from 'react'

type ReportPreviewProps = {
  propertyId: string
  owner: string
  recommendation: number
  score: number
  reasoning: string
}

function ReportPreview({ propertyId, owner, recommendation, score, reasoning }: ReportPreviewProps) {
  return (
    <section className="as-card as-report">
      <h2>ตัวอย่างรายงาน</h2>
      <div className="as-report-paper">
        <header>
          <strong>รายงานประเมินทรัพย์สินด้วย AI</strong>
          <span>{new Date().toLocaleDateString('th-TH')}</span>
        </header>
        <div className="as-report-grid">
          <div><span>รหัสทรัพย์</span><strong>{propertyId}</strong></div>
          <div><span>เจ้าของ</span><strong>{owner}</strong></div>
          <div><span>ราคาประเมิน AI</span><strong>{recommendation.toLocaleString()} บาท</strong></div>
          <div><span>คะแนนรวม</span><strong>{score}</strong></div>
        </div>
        <p>{reasoning}</p>
        <footer>ลายเซ็นผู้ประเมิน: ____________________</footer>
      </div>
    </section>
  )
}

export default memo(ReportPreview)
