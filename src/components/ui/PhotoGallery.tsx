import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'

export type PhotoGalleryProps = {
  images: string[]
}

export function PhotoGallery({ images }: PhotoGalleryProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: spacing[2] }}>
      {images.slice(0, 6).map((image, index) => (
        <div key={`${image}-${index}`} style={{ aspectRatio: '1/1', borderRadius: radius.medium, overflow: 'hidden', background: colors.background }}>
          <img src={image} alt={`ภาพ ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}
    </div>
  )
}
