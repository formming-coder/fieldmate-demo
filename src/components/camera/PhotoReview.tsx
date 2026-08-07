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
  onApplyCrop: () => void
  onRetake: () => void
  onAccept: () => void
  onDelete: () => void
  onSaveImage: () => void
}

function PhotoReview({ photos, index, zoom, rotate, cropEnabled, onPrev, onNext, onZoom, onRotate, onToggleCrop, onApplyCrop, onRetake, onAccept, onDelete, onSaveImage }: PhotoReviewProps) {
  const current = photos[index]
  if (!current) return null

  return (
    <section className="cam-review">
      <div className="cam-review-frame">
        <img src={current.url} alt={`review-${current.id}`} style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }} />
        {cropEnabled ? <div className="cam-crop-guide" /> : null}
      </div>
      <div className="cam-review-actions">
        <button type="button" onClick={onPrev} disabled={index === 0}>ก่อนหน้า</button>
        <button type="button" onClick={onNext} disabled={index === photos.length - 1}>ถัดไป</button>
        <button type="button" onClick={onRotate}>หมุนภาพ</button>
        <button type="button" onClick={onToggleCrop}>{cropEnabled ? 'ปิดครอป' : 'เปิดครอป'}</button>
        {cropEnabled ? <button type="button" onClick={onApplyCrop}>ใช้ครอป</button> : null}
      </div>
      <input type="range" min={1} max={2.2} step={0.05} value={zoom} onChange={(event) => onZoom(Number(event.target.value))} />
      <div className="cam-review-cta">
        <button type="button" onClick={onRetake}>ถ่ายใหม่</button>
        <button type="button" onClick={onDelete}>ลบภาพ</button>
        <button type="button" onClick={onSaveImage}>บันทึกรูป</button>
        <button type="button" className="is-primary" onClick={onAccept}>ใช้ภาพนี้</button>
      </div>
    </section>
  )
}

export default memo(PhotoReview)
