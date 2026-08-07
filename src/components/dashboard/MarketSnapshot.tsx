import React, { memo } from 'react'
import { formatThaiCurrency } from '../../lib/locale'

type MarketSnapshotProps = {
  average: number
  segments: Array<{ label: string; value: string; trend: 'เพิ่มขึ้น' | 'ลดลง' | 'ทรงตัว' }>
}

function MarketSnapshot({ average, segments }: MarketSnapshotProps) {
  const trendLabel = (trend: 'เพิ่มขึ้น' | 'ลดลง' | 'ทรงตัว') => trend

  return (
    <section className="db-card">
      <div className="db-eyebrow">ภาพรวมตลาด</div>
      <h2>ราคาเฉลี่ย {formatThaiCurrency(average)}</h2>
      <div className="db-market-grid">
        {segments.map((segment) => (
          <div key={segment.label}>
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
            <em>{trendLabel(segment.trend)}</em>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(MarketSnapshot)
