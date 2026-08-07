import React, { memo } from 'react'
import { Polygon } from 'react-leaflet'

type ForestOverlayProps = {
  opacity: number
}

const protectedArea: Array<[number, number]> = [
  [13.754, 100.49],
  [13.768, 100.5],
  [13.774, 100.521],
  [13.762, 100.536],
  [13.744, 100.528],
]

const bufferZone: Array<[number, number]> = [
  [13.735, 100.505],
  [13.742, 100.515],
  [13.736, 100.536],
  [13.722, 100.529],
  [13.724, 100.512],
]

function ForestOverlay({ opacity }: ForestOverlayProps) {
  return (
    <>
      <Polygon positions={protectedArea} pathOptions={{ color: '#0f8a46', fillColor: '#39b86a', fillOpacity: opacity * 0.34, weight: 2 }} />
      <Polygon positions={bufferZone} pathOptions={{ color: '#2f9d57', fillColor: '#83d27d', fillOpacity: opacity * 0.24, dashArray: '8 8', weight: 2 }} />
    </>
  )
}

export default memo(ForestOverlay)
