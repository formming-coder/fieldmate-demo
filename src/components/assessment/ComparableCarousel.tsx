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
      <h2>ทรัพย์เปรียบเทียบ</h2>
      <div className="as-comparable-rail">
        {items.map((item) => (
          <button type="button" key={item.id} onClick={() => onCompare(item.id)} className="as-compare-card">
            <strong>{item.title}</strong>
            <span>ความคล้าย {item.similarity}%</span>
            <span>{item.distanceKm.toFixed(1)} กม.</span>
            <span>{item.price.toLocaleString()} บาท</span>
            <span>{item.pricePerSqm.toLocaleString()} บาท/ตร.ม.</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default memo(ComparableCarousel)
