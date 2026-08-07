import React, { memo } from 'react'
import { Property } from '../../types'

type NearbyItem = {
  property: Property
  distanceKm: number
  similarity: number
}

type NearbyCarouselProps = {
  items: NearbyItem[]
  onSelect: (property: Property) => void
}

function NearbyCarousel({ items, onSelect }: NearbyCarouselProps) {
  return (
    <section className="smart-nearby">
      <h3>Nearby Properties</h3>
      <div className="smart-nearby-rail">
        {items.map((item) => (
          <button type="button" key={item.property.id} className="smart-nearby-card" onClick={() => onSelect(item.property)}>
            <img src={item.property.images[0]} alt={item.property.owner} loading="lazy" />
            <div>
              <strong>{item.property.owner}</strong>
              <div>{item.distanceKm.toFixed(1)} km • THB {item.property.marketPrice.toLocaleString()}</div>
              <div>Similarity {item.similarity}%</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

export default memo(NearbyCarousel)
