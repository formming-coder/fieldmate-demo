import { formatThaiCurrency } from '../../lib/locale'
import React, { memo } from 'react'

export type SharedPropertyCardData = {
  id: string
  image: string
  propertyType: string
  salePrice: number
  landArea: string
  province: string
  captureDate: string
  officer: string
  aiConfidence: number
  gps: string
  distance: string
  bookmarked: boolean
}

type SharedPropertyCardProps = {
  property: SharedPropertyCardData
  onOpen: () => void
  onBookmark: () => void
  onShare: () => void
}

function SharedPropertyCard({ property, onOpen, onBookmark, onShare }: SharedPropertyCardProps) {
  return (
    <article className="spi-card">
      <div className="spi-card-image-wrap">
        <img src={property.image} alt={property.id} className="spi-card-image" />
        <div className="spi-card-badges">
          <span>{property.propertyType}</span>
          <span>AI {property.aiConfidence}%</span>
        </div>
      </div>
      <div className="spi-card-body">
        <div className="spi-card-header">
          <div>
            <h3>{property.id}</h3>
            <p>{property.province} • {property.landArea}</p>
          </div>
          <strong>{formatThaiCurrency(property.salePrice)}</strong>
        </div>
        <div className="spi-card-meta">
          <span>{property.captureDate}</span>
          <span>{property.officer}</span>
          <span>{property.gps}</span>
          <span>{property.distance}</span>
        </div>
        <div className="spi-card-actions">
          <button type="button" onClick={onBookmark}>{property.bookmarked ? 'บันทึกแล้ว' : 'บันทึก'}</button>
          <button type="button" onClick={onShare}>แชร์</button>
          <button type="button" className="is-primary" onClick={onOpen}>เปิดดู</button>
        </div>
      </div>
    </article>
  )
}

export default memo(SharedPropertyCard)
