import React, { memo } from 'react'

type TripSummaryProps = {
  properties: number
  distanceKm: number
  estimatedTime: string
  fuelCost: number
  efficiency: number
}

function TripSummary({ properties, distanceKm, estimatedTime, fuelCost, efficiency }: TripSummaryProps) {
  return (
    <section className="rp-card rp-summary-card">
      <div>
        <div className="rp-eyebrow">Today's Inspection</div>
        <h2>{properties} Properties</h2>
      </div>
      <div className="rp-summary-grid">
        <div><span>Distance</span><strong>{distanceKm} km</strong></div>
        <div><span>Estimated Time</span><strong>{estimatedTime}</strong></div>
        <div><span>Fuel Cost</span><strong>{fuelCost} THB</strong></div>
        <div><span>AI Efficiency</span><strong>{efficiency}%</strong></div>
      </div>
    </section>
  )
}

export default memo(TripSummary)
