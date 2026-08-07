import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'

export type MapMarkerProps = {
  active?: boolean
}

export function MapMarker({ active = false }: MapMarkerProps) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: radius.extra, border: `3px solid ${colors.surface}`, background: active ? colors.primary : colors.secondary, boxShadow: '0 8px 24px rgba(17, 24, 39, 0.16)' }} />
  )
}
