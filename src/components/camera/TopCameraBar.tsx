import React, { memo } from 'react'

type TopCameraBarProps = {
  offline: boolean
  aiEnabled: boolean
  battery: number
  gpsReady: boolean
  onBack: () => void
}

function TopCameraBar({ offline, aiEnabled, battery, gpsReady, onBack }: TopCameraBarProps) {
  return (
    <header className="cam-topbar">
      <button type="button" className="cam-top-btn" onClick={onBack} aria-label="Back">‹</button>
      <div className="cam-top-center">
        <button type="button" className="cam-top-chip">Flash</button>
        <button type="button" className="cam-top-chip">HDR</button>
        <span className={`cam-top-chip ${aiEnabled ? 'is-ai' : ''}`}>AI</span>
      </div>
      <div className="cam-top-right">
        <span className="cam-top-meta">{battery}%</span>
        <span className={`cam-top-meta ${gpsReady ? 'is-good' : ''}`}>GPS</span>
        {offline ? <span className="cam-top-meta is-warn">Offline</span> : null}
      </div>
    </header>
  )
}

export default memo(TopCameraBar)
