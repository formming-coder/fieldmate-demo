import React, { memo } from 'react'

type NearbyPropertyProps = {
  items: Array<{ title: string; type: string; distance: string }>
}

function NearbyProperty({ items }: NearbyPropertyProps) {
  return (
    <section className="rp-card">
      <div className="rp-eyebrow">คำแนะนำใกล้เคียง</div>
      <h2>บริบทสำคัญรอบพื้นที่</h2>
      <div className="rp-nearby-list">
        {items.map((item) => (
          <div key={`${item.title}-${item.type}`} className="rp-nearby-item">
            <strong>{item.title}</strong>
            <span>{item.type}</span>
            <em>{item.distance}</em>
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(NearbyProperty)
