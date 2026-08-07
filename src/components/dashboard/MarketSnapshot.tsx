import React, { memo } from 'react'

type MarketSnapshotProps = {
  average: number
  segments: Array<{ label: string; value: string; trend: 'Up' | 'Down' | 'Stable' }>
}

function MarketSnapshot({ average, segments }: MarketSnapshotProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">Market Snapshot</div>
      <h2>Average price THB {average.toLocaleString()}</h2>
      <div className="db-market-grid">
        {segments.map((segment) => (
          <div key={segment.label}>
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
            <em>{segment.trend}</em>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(MarketSnapshot)
