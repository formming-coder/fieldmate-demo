import React, { RefObject } from 'react'

type CameraPreviewProps = {
  videoRef: RefObject<HTMLVideoElement>
  active: boolean
  frozenImage?: string
  flashActive?: boolean
}

export default function CameraPreview({ videoRef, active, frozenImage, flashActive = false }: CameraPreviewProps) {
  return (
    <div className="survey-ai-preview">
      <video ref={videoRef} className={active && !frozenImage ? 'is-visible' : ''} autoPlay muted playsInline />
      {frozenImage ? <img src={frozenImage} alt="ภาพที่เพิ่งถ่าย" /> : null}
      <div className="survey-ai-scan-frame" aria-hidden="true"><span /><span /><span /><span /></div>
      {flashActive ? <div className="survey-ai-capture-flash" /> : null}
    </div>
  )
}