import React, { memo } from 'react'

type ReviewPhoto = {
  id: string
  url: string
  mode: string
}

type PhotoReviewProps = {
  photos: ReviewPhoto[]
  index: number
  zoom: number
  rotate: number
  cropEnabled: boolean
  onPrev: () => void
  onNext: () => void
  onZoom: (value: number) => void
  onRotate: () => void
  onToggleCrop: () => void
  onRetake: () => void
  onAccept: () => void
  onDelete: () => void
}

function PhotoReview({ photos, index, zoom, rotate, cropEnabled, onPrev, onNext, onZoom, onRotate, onToggleCrop, onRetake, onAccept, onDelete }: PhotoReviewProps) {
  const current = photos[index]
  if (!current) return null

  return (
    <section className="cam-review">
      <div className="cam-review-frame">
        <img src={current.url} alt={`review-${current.id}`} style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }} />
        {cropEnabled ? <div className="cam-crop-guide" /> : null}
      </div>
      <div className="cam-review-actions">
        <button type="button" onClick={onPrev} disabled={index === 0}>Prev</button>
        <button type="button" onClick={onNext} disabled={index === photos.length - 1}>Next</button>
        <button type="button" onClick={onRotate}>Rotate</button>
        <button type="button" onClick={onToggleCrop}>{cropEnabled ? 'Crop Off' : 'Crop On'}</button>
      </div>
      <input type="range" min={1} max={2.2} step={0.05} value={zoom} onChange={(event) => onZoom(Number(event.target.value))} />
      <div className="cam-review-cta">
        <button type="button" onClick={onRetake}>Retake</button>
        <button type="button" onClick={onDelete}>Delete</button>
        <button type="button" className="is-primary" onClick={onAccept}>Accept</button>
      </div>
    </section>
  )
}

export default memo(PhotoReview)
