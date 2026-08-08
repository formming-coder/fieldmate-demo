import React, { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type PropertyGalleryProps = {
  images: string[]
  onDownload: () => void
  onCopy: () => void
}

function PropertyGallery({ images, onDownload, onCopy }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const touchStartRef = useRef<number | null>(null)
  const active = images[activeIndex]

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
    if (delta < -48) setActiveIndex((current) => Math.min(current + 1, images.length - 1))
    if (delta > 48) setActiveIndex((current) => Math.max(current - 1, 0))
  }

  return (
    <section className="spi-section">
      <div className="spi-section-title">แกลเลอรีภาพ</div>
      <div
        className="spi-gallery-hero"
        onTouchStart={(event) => { touchStartRef.current = event.touches[0]?.clientX ?? null }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
      >
        <button type="button" onClick={() => setFullscreen(true)} aria-label={`เปิดภาพ ${activeIndex + 1} แบบเต็มจอ`}>
          <img src={active} alt={`property-${activeIndex + 1}`} />
        </button>
      </div>
      <div className="spi-gallery-strip">
        {images.map((image, index) => (
          <button type="button" key={`${image}-${index}`} onClick={() => setActiveIndex(index)}>
            <img src={image} alt={`thumb-${index + 1}`} className={index === activeIndex ? 'is-active' : ''} />
          </button>
        ))}
      </div>
      <div className="spi-inline-actions">
        <button type="button" onClick={onDownload}>ดาวน์โหลด</button>
        <button type="button" onClick={onCopy}>คัดลอก</button>
      </div>
      {fullscreen && active ? createPortal(
        <div className="property-gallery-fullscreen" data-property-gallery-fullscreen role="dialog" aria-modal="true" aria-label="ภาพทรัพย์สินเต็มจอ" onClick={() => setFullscreen(false)}>
          <button type="button" className="property-gallery-fullscreen-close" onClick={() => setFullscreen(false)} aria-label="ปิดภาพเต็มจอ">×</button>
          <img src={active} alt={`property-${activeIndex + 1}`} onClick={(event) => event.stopPropagation()} />
        </div>,
        document.body,
      ) : null}
    </section>
  )
}

export default memo(PropertyGallery)
