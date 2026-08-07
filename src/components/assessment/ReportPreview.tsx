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
      <h2>Report Preview</h2>
      <div className="as-report-paper">
        <header>
          <strong>Fieldmate AI Assessment Report</strong>
          <span>{new Date().toLocaleDateString('th-TH')}</span>
        </header>
        <div className="as-report-grid">
          <div><span>Property ID</span><strong>{propertyId}</strong></div>
          <div><span>Owner</span><strong>{owner}</strong></div>
          <div><span>AI Appraisal</span><strong>THB {recommendation.toLocaleString()}</strong></div>
          <div><span>Overall Score</span><strong>{score}</strong></div>
        </div>
        <p>{reasoning}</p>
        <footer>Signature: ____________________</footer>
      </div>
    </section>
  )
}

export default memo(ReportPreview)
