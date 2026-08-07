import React, { memo } from 'react'

type Detection = {
  id: string
  label: string
  confidence: number
  x: number
  y: number
  w: number
  h: number
}

type CameraOverlayProps = {
  aid: string
  propertyId: string
  level: number
  compass: number
  gpsAccuracy: number
  timestamp: string
  detections: Detection[]
}

function CameraOverlay({ aid, propertyId, level, compass, gpsAccuracy, timestamp, detections }: CameraOverlayProps) {
  return (
    <>
      <div className="cam-grid" aria-hidden="true" />
      <div className="cam-golden" aria-hidden="true" />
      <div className="cam-level" aria-label="Level indicator">
        <span style={{ transform: `translateX(${Math.max(-45, Math.min(45, level))}px)` }} />
      </div>
      <div className="cam-overlay-meta">
        <span>AID {aid}</span>
        <span>Property {propertyId}</span>
        <span>GPS ±{gpsAccuracy.toFixed(1)}m</span>
        <span>Compass {Math.round(compass)}°</span>
        <span>{timestamp}</span>
      </div>
      {detections.map((detection) => (
        <div
          key={detection.id}
          className="cam-detection"
          style={{
            left: `${detection.x}%`,
            top: `${detection.y}%`,
            width: `${detection.w}%`,
            height: `${detection.h}%`,
          }}
        >
          <span>{detection.label} {Math.round(detection.confidence * 100)}%</span>
        </div>
      ))}
    </>
  )
}

export default memo(CameraOverlay)
