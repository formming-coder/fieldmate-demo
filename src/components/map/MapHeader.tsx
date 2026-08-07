import React, { memo } from 'react'
import BrandMark from '../BrandMark'

type MapHeaderProps = {
  todayLabel: string
  offline: boolean
}

function MapHeader({ todayLabel, offline }: MapHeaderProps) {
  return (
    <div className="map-header">
      <div className="map-header-leading">
        <BrandMark size="small" />
        <div>
          <div className="map-header-title">Smart Map Pro</div>
          <div className="map-header-subtitle">{todayLabel}</div>
        </div>
      </div>
      <div className="map-header-statuses">
        {offline ? <span className="map-pill map-pill-offline">Offline mode</span> : null}
        <span className="map-pill">Cached map</span>
      </div>
    </div>
  )
}

export default memo(MapHeader)
