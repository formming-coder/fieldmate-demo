import React, { memo } from 'react'

type MiniMapProps = {
  coordinates: string
  nearby: string
  onOpenMap: () => void
}

function MiniMap({ coordinates, nearby, onOpenMap }: MiniMapProps) {
  return (
    <section className="spi-mini-map" onClick={onOpenMap} role="button" tabIndex={0}>
      <div className="spi-mini-map-surface" />
      <div className="spi-mini-map-overlay">
        <strong>{coordinates}</strong>
        <p>{nearby}</p>
        <span>แตะเพื่อเปิดแผนที่อัจฉริยะ</span>
      </div>
    </section>
  )
}

export default memo(MiniMap)
