import React, { memo } from 'react'

type GPSOverlayProps = {
  lat: number
  lon: number
  altitude: number
  direction: number
  accuracy: number
}

function GPSOverlay({ lat, lon, altitude, direction, accuracy }: GPSOverlayProps) {
  return (
    <aside className="cam-gps-card" aria-label="GPS metadata">
      <div>{lat.toFixed(6)}, {lon.toFixed(6)}</div>
      <div>Alt {altitude.toFixed(1)} m</div>
      <div>Dir {Math.round(direction)}°</div>
      <div>Acc ±{accuracy.toFixed(1)} m</div>
    </aside>
  )
}

export default memo(GPSOverlay)
