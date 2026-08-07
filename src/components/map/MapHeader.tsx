import React, { memo } from 'react'
import BrandMark from '../BrandMark'

type MapHeaderProps = {
  todayLabel: string
  offline: boolean
  gpsLabel: string
  queuedCount: number
}

function MapHeader({ todayLabel, offline, gpsLabel, queuedCount }: MapHeaderProps) {
  return (
    <div className="map-header">
      <div className="map-header-leading">
        <BrandMark size="small" />
        <div>
          <div className="map-header-title">ตำแหน่งปัจจุบัน</div>
          <div className="map-header-subtitle">{todayLabel} • พร้อมสำรวจภาคสนาม</div>
        </div>
      </div>
      <div className="map-header-statuses">
        <span className="map-pill">{gpsLabel}</span>
        {offline ? <span className="map-pill map-pill-offline">โหมดออฟไลน์</span> : null}
        <span className="map-pill">รอซิงก์ {queuedCount}</span>
      </div>
    </div>
  )
}

export default memo(MapHeader)
