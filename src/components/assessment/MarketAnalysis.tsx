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
      <h2>วิเคราะห์ตลาด</h2>
      <div className="as-grid">
        <div><span>ราคาเฉลี่ย</span><strong>{average.toLocaleString()} บาท</strong></div>
        <div><span>ราคากลาง</span><strong>{median.toLocaleString()} บาท</strong></div>
        <div><span>แนวโน้ม</span><strong>{growth > 0 ? '+' : ''}{growth.toFixed(1)}%</strong></div>
        <div><span>อุปสงค์</span><strong>{demand}%</strong></div>
        <div><span>อุปทาน</span><strong>{supply}%</strong></div>
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
