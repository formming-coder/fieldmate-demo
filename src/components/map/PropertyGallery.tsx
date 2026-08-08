import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type PropertyGalleryProps = {
  images: string[]
  title: string
}

const fallbackImage = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'

function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [index, setIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const touchStartRef = useRef<number | null>(null)
  const list = useMemo(() => (images.length ? images : [fallbackImage]), [images])

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fullscreen])

  const finishSwipe = (clientX: number) => {
    if (touchStartRef.current === null) return
    const delta = clientX - touchStartRef.current
    touchStartRef.current = null
    if (delta < -48) setIndex((current) => Math.min(current + 1, list.length - 1))
    if (delta > 48) setIndex((current) => Math.max(current - 1, 0))
  }

  return (
    <div className="smart-gallery">
      <div
        className="smart-gallery-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={(event) => { touchStartRef.current = event.touches[0]?.clientX ?? null }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
      >
        {list.map((image, imageIndex) => (
          <button type="button" className="smart-gallery-frame" key={`${image}-${imageIndex}`} onClick={() => setFullscreen(true)} aria-label={`เปิดภาพ ${imageIndex + 1} แบบเต็มจอ`}>
            <img src={image} alt={`${title}-${imageIndex + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
      <div className="smart-gallery-counter">{index + 1}/{list.length}</div>
      <div className="smart-gallery-controls">
        <button type="button" onClick={() => setIndex((current) => Math.max(current - 1, 0))} disabled={index === 0}>‹</button>
        <button type="button" onClick={() => setIndex((current) => Math.min(current + 1, list.length - 1))} disabled={index === list.length - 1}>›</button>
      </div>
      {fullscreen ? createPortal(
        <div className="property-gallery-fullscreen" data-property-gallery-fullscreen role="dialog" aria-modal="true" aria-label="ภาพทรัพย์สินเต็มจอ" onClick={() => setFullscreen(false)}>
          <button type="button" className="property-gallery-fullscreen-close" onClick={() => setFullscreen(false)} aria-label="ปิดภาพเต็มจอ">×</button>
          <img src={list[index]} alt={`${title}-${index + 1}`} onClick={(event) => event.stopPropagation()} />
        </div>,
        document.body,
      ) : null}
    </div>
  )
}

export default memo(PropertyGallery)
