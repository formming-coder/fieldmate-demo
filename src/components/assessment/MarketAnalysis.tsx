import React, { memo } from 'react'

type MarketAnalysisProps = {
  average: number
  median: number
  growth: number
  demand: number
  supply: number
}

function MarketAnalysis({ average, median, growth, demand, supply }: MarketAnalysisProps) {
  return (
    <section className="as-card">
      <h2>Market Analysis</h2>
      <div className="as-grid">
        <div><span>Average</span><strong>THB {average.toLocaleString()}</strong></div>
        <div><span>Median</span><strong>THB {median.toLocaleString()}</strong></div>
        <div><span>Trend</span><strong>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</strong></div>
        <div><span>Demand</span><strong>{demand}%</strong></div>
        <div><span>Supply</span><strong>{supply}%</strong></div>
      </div>
      <div className="as-chart">
        <i style={{ height: `${40 + demand * 0.4}%` }} />
        <i style={{ height: `${38 + supply * 0.42}%` }} />
        <i style={{ height: `${52 + growth * 1.3}%` }} />
        <i style={{ height: `${46 + demand * 0.35}%` }} />
        <i style={{ height: `${44 + supply * 0.3}%` }} />
      </div>
    </section>
  )
}

export default memo(MarketAnalysis)
