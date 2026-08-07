import React, { memo } from 'react'

type TravelAnalyticsProps = {
  distance: string
  drivingTime: string
  idleTime: string
  inspectionTime: string
  fuelEstimate: string
  carbonSaving: string
}

function TravelAnalytics({ distance, drivingTime, idleTime, inspectionTime, fuelEstimate, carbonSaving }: TravelAnalyticsProps) {
  return (
    <section className="rp-card">
      <div className="rp-eyebrow">Travel Analytics</div>
      <h2>Trip breakdown</h2>
      <div className="rp-info-grid">
        <div><span>Distance</span><strong>{distance}</strong></div>
        <div><span>Driving Time</span><strong>{drivingTime}</strong></div>
        <div><span>Idle Time</span><strong>{idleTime}</strong></div>
        <div><span>Inspection Time</span><strong>{inspectionTime}</strong></div>
        <div><span>Fuel Estimate</span><strong>{fuelEstimate}</strong></div>
        <div><span>Carbon Saving</span><strong>{carbonSaving}</strong></div>
      </div>
    </section>
  )
}

export default memo(TravelAnalytics)
