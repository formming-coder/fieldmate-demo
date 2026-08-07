import React, { memo } from 'react'

type DistanceItem = {
  label: string
  distance: string
}

type LocationAnalysisProps = {
  province: string
  district: string
  subdistrict: string
  gps: string
  distances: DistanceItem[]
}

function LocationAnalysis({ province, district, subdistrict, gps, distances }: LocationAnalysisProps) {
  return (
    <section className="as-card">
      <h2>Location Analysis</h2>
      <div className="as-grid">
        <div><span>Province</span><strong>{province}</strong></div>
        <div><span>District</span><strong>{district}</strong></div>
        <div><span>Subdistrict</span><strong>{subdistrict}</strong></div>
        <div><span>GPS</span><strong>{gps}</strong></div>
      </div>
      <div className="as-distance-row">
        {distances.map((item) => (
          <article key={item.label}>
            <strong>{item.distance}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default memo(LocationAnalysis)
