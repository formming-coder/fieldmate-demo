import React, { memo } from 'react'

type ConfidenceCardProps = {
  confidence: number
}

function confidenceTone(confidence: number) {
  if (confidence >= 80) return 'good'
  if (confidence >= 60) return 'warn'
  return 'bad'
}

function ConfidenceCard({ confidence }: ConfidenceCardProps) {
  const tone = confidenceTone(confidence)
  return (
    <section className="as-card as-confidence-card">
      <h2>AI Confidence</h2>
      <div className="as-confidence-wrap">
        <svg viewBox="0 0 120 120" className={`as-ring ${tone}`}>
          <circle className="as-ring-track" cx="60" cy="60" r="48" pathLength="100" />
          <circle className="as-ring-fill" cx="60" cy="60" r="48" pathLength="100" style={{ strokeDasharray: '100', strokeDashoffset: `${100 - confidence}` }} />
        </svg>
        <div className="as-confidence-value">
          <strong>{confidence}%</strong>
          <span>Overall confidence</span>
        </div>
      </div>
    </section>
  )
}

export default memo(ConfidenceCard)
