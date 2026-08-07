import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'

export type AvatarProps = {
  name: string
  size?: number
}

export function Avatar({ name, size = 44 }: AvatarProps) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius.extra, background: colors.primary, color: colors.secondary, display: 'grid', placeItems: 'center', fontWeight: 800 }}>
      {name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()}
    </div>
  )
}
