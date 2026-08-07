import React, { memo } from 'react'

type TopCameraBarProps = {
  offline: boolean
  aiEnabled: boolean
  battery: number
  gpsReady: boolean
  flashEnabled: boolean
  flashAvailable: boolean
  onToggleFlash: () => void
  onSwitchCamera: () => void
  onBack: () => void
}

function TopCameraBar({ offline, aiEnabled, battery, gpsReady, flashEnabled, flashAvailable, onToggleFlash, onSwitchCamera, onBack }: TopCameraBarProps) {
  return (
    <header className="cam-topbar">
      <button type="button" className="cam-top-btn" onClick={onBack} aria-label="ย้อนกลับ">‹</button>
      <div className="cam-top-center">
        <button type="button" className={`cam-top-chip ${flashEnabled ? 'is-ai' : ''}`} onClick={onToggleFlash} disabled={!flashAvailable}>{flashAvailable ? (flashEnabled ? 'แฟลชเปิด' : 'แฟลชปิด') : 'ไม่มีแฟลช'}</button>
        <button type="button" className="cam-top-chip" onClick={onSwitchCamera}>สลับกล้อง</button>
        <span className={`cam-top-chip ${aiEnabled ? 'is-ai' : ''}`}>AI</span>
      </div>
      <div className="cam-top-right">
        <span className="cam-top-meta">{battery}%</span>
        <span className={`cam-top-meta ${gpsReady ? 'is-good' : ''}`}>GPS</span>
        {offline ? <span className="cam-top-meta is-warn">ออฟไลน์</span> : null}
      </div>
    </header>
  )
}

export default memo(TopCameraBar)
