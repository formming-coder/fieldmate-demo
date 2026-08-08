import React from 'react'

type CameraControlsProps = {
  onGallery: () => void
  onCapture: () => void
  onSwitch: () => void
  onFlash: () => void
  flashEnabled: boolean
  flashAvailable: boolean
  disabled: boolean
}

export default function CameraControls({ onGallery, onCapture, onSwitch, onFlash, flashEnabled, flashAvailable, disabled }: CameraControlsProps) {
  return (
    <div className="survey-ai-controls">
      <button type="button" onClick={onGallery}><span className="material-symbols-rounded" aria-hidden="true">photo_library</span><small>คลังรูป</small></button>
      <button type="button" className="survey-ai-shutter" aria-label="ถ่ายรูป" disabled={disabled} onClick={onCapture}><span /></button>
      <button type="button" onClick={onSwitch}><span className="material-symbols-rounded" aria-hidden="true">cameraswitch</span><small>สลับกล้อง</small></button>
      <button type="button" disabled={!flashAvailable} onClick={onFlash}><span className="material-symbols-rounded" aria-hidden="true">{flashEnabled ? 'flash_on' : 'flash_off'}</span><small>แฟลช</small></button>
    </div>
  )
}