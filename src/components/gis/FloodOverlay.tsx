import React, { memo } from 'react'
import { Circle, Polyline } from 'react-leaflet'

type FloodOverlayProps = {
  opacity: number
}

function FloodOverlay({ opacity }: FloodOverlayProps) {
  return (
    <>
      <Circle center={[13.743, 100.512]} radius={680} pathOptions={{ color: '#3d7dff', fillColor: '#5f9cff', fillOpacity: opacity * 0.28, weight: 2 }} />
      <Circle center={[13.758, 100.544]} radius={420} pathOptions={{ color: '#6da9ff', fillColor: '#8ec2ff', fillOpacity: opacity * 0.22, weight: 2 }} />
      <Polyline positions={[[13.736, 100.498], [13.741, 100.514], [13.746, 100.533], [13.751, 100.548]]} pathOptions={{ color: '#4fa7ff', weight: 4, opacity: Math.max(0.4, opacity) }} />
    </>
  )
}

export default memo(FloodOverlay)
