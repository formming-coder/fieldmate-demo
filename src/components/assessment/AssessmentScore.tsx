import React, { memo } from 'react'

type AssessmentScoreProps = {
  score: number
}

function rating(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Average'
  return 'Poor'
}

function AssessmentScore({ score }: AssessmentScoreProps) {
  return (
    <section className="as-card as-score-card">
      <h2>Assessment Score</h2>
      <div className="as-score-value">{score}</div>
      <div className="as-score-label">{rating(score)}</div>
    </section>
  )
}

export default memo(AssessmentScore)
