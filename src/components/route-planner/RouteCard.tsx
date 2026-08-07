import React, { memo } from 'react'

type RouteCardProps = {
  title: string
  startLocation: string
  currentGps: string
  finishTime: string
  stopCount: number
}

function RouteCard({ title, startLocation, currentGps, finishTime, stopCount }: RouteCardProps) {
  return (
    <section className="rp-card rp-route-card">
      <div>
        <div className="rp-eyebrow">Route Planner</div>
        <h2>{title}</h2>
      </div>
      <div className="rp-info-list">
        <div><span>Start Location</span><strong>{startLocation}</strong></div>
        <div><span>Current GPS</span><strong>{currentGps}</strong></div>
        <div><span>Destination List</span><strong>{stopCount} stops</strong></div>
        <div><span>Estimated Finish</span><strong>{finishTime}</strong></div>
      </div>
    </section>
  )
}

export default memo(RouteCard)
