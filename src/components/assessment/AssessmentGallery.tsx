import React, { memo, useMemo, useState } from 'react'

type GalleryImage = {
  id: string
  url: string
  category: 'Exterior' | 'Interior' | 'Document' | 'Road' | 'Land'
}

type AssessmentGalleryProps = {
  images: GalleryImage[]
}

function AssessmentGallery({ images }: AssessmentGalleryProps) {
  const [category, setCategory] = useState<GalleryImage['category']>('Exterior')
  const [zoom, setZoom] = useState(1)
  const filtered = useMemo(() => images.filter((item) => item.category === category), [category, images])

  return (
    <section className="as-card">
      <h2>Photo Gallery</h2>
      <div className="as-chip-row">
        {(['Exterior', 'Interior', 'Document', 'Road', 'Land'] as const).map((item) => (
          <button type="button" key={item} className="as-chip-btn" onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <div className="as-gallery-rail">
        {filtered.map((image) => (
          <article key={image.id}>
            <img src={image.url} alt={image.category} style={{ transform: `scale(${zoom})` }} />
            <span>{image.category}</span>
          </article>
        ))}
      </div>
      <input type="range" min={1} max={2} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
    </section>
  )
}

export default memo(AssessmentGallery)
