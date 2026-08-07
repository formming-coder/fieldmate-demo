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
      <div className="db-eyebrow">AI Assistant</div>
      <h2>Today's recommendation</h2>
      <p>{recommendation}</p>
      <div className="db-info-list">
        <div><span>Nearby tasks</span><strong>{nearbyTasks}</strong></div>
        <div><span>Risk alerts</span><strong>{riskAlert}</strong></div>
        <div><span>Suggested route</span><strong>{route}</strong></div>
        <div><span>Estimated travel time</span><strong>{travelTime}</strong></div>
      </div>
    </section>
  )
}

export default memo(AIRecommendation)
