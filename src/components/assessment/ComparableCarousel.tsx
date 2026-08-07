import React, { memo } from 'react'

type Comparable = {
  id: string
  title: string
  similarity: number
  distanceKm: number
  price: number
  pricePerSqm: number
}

type ComparableCarouselProps = {
  items: Comparable[]
  onCompare: (id: string) => void
}

function ComparableCarousel({ items, onCompare }: ComparableCarouselProps) {
  return (
    <section className="as-card">
      <h2>Comparable Properties</h2>
      <div className="as-comparable-rail">
        {items.map((item) => (
          <button type="button" key={item.id} onClick={() => onCompare(item.id)} className="as-compare-card">
            <strong>{item.title}</strong>
            <span>Similarity {item.similarity}%</span>
            <span>{item.distanceKm.toFixed(1)} km</span>
            <span>THB {item.price.toLocaleString()}</span>
            <span>THB {item.pricePerSqm.toLocaleString()}/sqm</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default memo(ComparableCarousel)
