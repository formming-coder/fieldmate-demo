import React, { memo } from 'react'
import { MarketAnalysis as MarketAnalysisType } from '../../types'

function MarketAnalysis({ analysis }: { analysis: MarketAnalysisType }) {
  return (
    <section className="as-card">
      <h2>แนวโน้มตลาด</h2>
      <div className="as-grid">
        <div><span>ราคาประกาศเฉลี่ย</span><strong>{analysis.averageListingPrice.toLocaleString('th-TH')} บาท</strong></div>
        <div><span>ราคาเฉลี่ยต่อตารางเมตร</span><strong>{analysis.averagePricePerSqm.toLocaleString('th-TH')} บาท</strong></div>
        <div><span>จำนวนทรัพย์เปรียบเทียบ</span><strong>{analysis.comparableCount} รายการ</strong></div>
        <div><span>ระยะทางเฉลี่ย</span><strong>{analysis.averageDistanceKm} กม.</strong></div>
        <div><span>แนวโน้มตลาด</span><strong>{analysis.trend} {analysis.trendPercent >= 0 ? '+' : ''}{analysis.trendPercent}%</strong></div>
      </div>
    </section>
  )
}

export default memo(MarketAnalysis)
