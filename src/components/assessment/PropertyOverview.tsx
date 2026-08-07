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
      <h2>ภาพรวมทรัพย์สิน</h2>
      <div className="as-grid">
        <div><span>ประเภททรัพย์</span><strong>{type}</strong></div>
        <div><span>พื้นที่อาคาร</span><strong>{buildingSize}</strong></div>
        <div><span>ขนาดที่ดิน</span><strong>{landArea}</strong></div>
        <div><span>จำนวนชั้น</span><strong>{floor}</strong></div>
        <div><span>อายุอาคาร</span><strong>{age}</strong></div>
        <div><span>สภาพโดยรวม</span><strong>{condition}</strong></div>
        <div><span>การครอบครอง</span><strong>{occupancy}</strong></div>
      </div>
    </section>
  )
}

export default memo(PropertyOverview)
