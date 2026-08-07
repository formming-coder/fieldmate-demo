import React, { memo } from 'react'

type PropertyOverviewProps = {
  type: string
  buildingSize: string
  landArea: string
  floor: string
  age: string
  condition: string
  occupancy: string
}

function PropertyOverview({ type, buildingSize, landArea, floor, age, condition, occupancy }: PropertyOverviewProps) {
  return (
    <section className="as-card">
      <h2>Property Overview</h2>
      <div className="as-grid">
        <div><span>Property Type</span><strong>{type}</strong></div>
        <div><span>Building Size</span><strong>{buildingSize}</strong></div>
        <div><span>Land Area</span><strong>{landArea}</strong></div>
        <div><span>Floor</span><strong>{floor}</strong></div>
        <div><span>Age</span><strong>{age}</strong></div>
        <div><span>Condition</span><strong>{condition}</strong></div>
        <div><span>Occupancy</span><strong>{occupancy}</strong></div>
      </div>
    </section>
  )
}

export default memo(PropertyOverview)
