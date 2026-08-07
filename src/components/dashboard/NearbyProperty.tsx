import React, { memo } from 'react'

type NearbyPropertyProps = {
  items: Array<{ title: string; distance: string; travelTime: string; image: string }>
}

function NearbyProperty({ items }: NearbyPropertyProps) {
  return (
    <section className="db-card">
      <div className="db-eyebrow">ทรัพย์สินใกล้เคียง</div>
      <h2>รอบพิกัด GPS ปัจจุบัน</h2>
      <div className="db-nearby-list">
        {items.map((item) => (
          <div key={`${item.title}-${item.distance}`} className="db-nearby-item">
            <img src={item.image} alt={item.title} />
            <div>
              <strong>{item.title}</strong>
              <span>{item.distance} • {item.travelTime}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(NearbyProperty)
