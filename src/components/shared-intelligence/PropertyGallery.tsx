import React, { memo, useState } from 'react'

type PropertyGalleryProps = {
  images: string[]
  onDownload: () => void
  onCopy: () => void
}

function PropertyGallery({ images, onDownload, onCopy }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]

  return (
    <section className="spi-section">
      <div className="spi-section-title">Photo Gallery</div>
      <div className="spi-gallery-hero">
        <img src={active} alt={`property-${activeIndex + 1}`} />
      </div>
      <div className="spi-gallery-strip">
        {images.map((image, index) => (
          <button type="button" key={`${image}-${index}`} onClick={() => setActiveIndex(index)}>
            <img src={image} alt={`thumb-${index + 1}`} className={index === activeIndex ? 'is-active' : ''} />
          </button>
        ))}
      </div>
      <div className="spi-inline-actions">
        <button type="button" onClick={onDownload}>Download</button>
        <button type="button" onClick={onCopy}>Copy</button>
      </div>
    </section>
  )
}

export default memo(PropertyGallery)
