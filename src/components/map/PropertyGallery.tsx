import React, { memo, useMemo, useState } from 'react'

type PropertyGalleryProps = {
  images: string[]
  title: string
}

const fallbackImage = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'

function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [index, setIndex] = useState(0)
  const list = useMemo(() => (images.length ? images : [fallbackImage]), [images])

  return (
    <div className="smart-gallery">
      <div className="smart-gallery-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {list.map((image, imageIndex) => (
          <div className="smart-gallery-frame" key={`${image}-${imageIndex}`}>
            <img src={image} alt={`${title}-${imageIndex + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
      <div className="smart-gallery-counter">{index + 1}/{list.length}</div>
      <div className="smart-gallery-controls">
        <button type="button" onClick={() => setIndex((current) => Math.max(current - 1, 0))} disabled={index === 0}>‹</button>
        <button type="button" onClick={() => setIndex((current) => Math.min(current + 1, list.length - 1))} disabled={index === list.length - 1}>›</button>
      </div>
    </div>
  )
}

export default memo(PropertyGallery)
