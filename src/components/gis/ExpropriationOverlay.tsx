import React, { memo } from 'react'
import { Polyline } from 'react-leaflet'

type ExpropriationOverlayProps = {
  opacity: number
}

function ExpropriationOverlay({ opacity }: ExpropriationOverlayProps) {
  return (
    <>
      <Polyline positions={[[13.732, 100.503], [13.744, 100.516], [13.756, 100.531], [13.768, 100.546]]} pathOptions={{ color: '#ff5c43', weight: 5, opacity: Math.max(0.5, opacity), dashArray: '10 8' }} />
      <Polyline positions={[[13.748, 100.495], [13.759, 100.509], [13.771, 100.523]]} pathOptions={{ color: '#f07d4a', weight: 4, opacity: Math.max(0.45, opacity), dashArray: '4 7' }} />
    </>
  )
}

export default memo(ExpropriationOverlay)
