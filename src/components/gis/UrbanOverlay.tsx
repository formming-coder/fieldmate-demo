import React, { memo } from 'react'
import { Rectangle } from 'react-leaflet'

type UrbanOverlayProps = {
  opacity: number
}

function UrbanOverlay({ opacity }: UrbanOverlayProps) {
  return (
    <>
      <Rectangle bounds={[[13.745, 100.505], [13.759, 100.52]]} pathOptions={{ color: '#f6b100', fillColor: '#ffd35a', fillOpacity: opacity * 0.22, weight: 2 }} />
      <Rectangle bounds={[[13.759, 100.52], [13.772, 100.538]]} pathOptions={{ color: '#d57433', fillColor: '#ef9b5f', fillOpacity: opacity * 0.22, weight: 2 }} />
      <Rectangle bounds={[[13.731, 100.52], [13.744, 100.539]]} pathOptions={{ color: '#6f9d55', fillColor: '#8bc16e', fillOpacity: opacity * 0.2, weight: 2 }} />
    </>
  )
}

export default memo(UrbanOverlay)
