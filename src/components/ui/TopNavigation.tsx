import React from 'react'
import { IconButton } from './IconButton'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type TopNavigationProps = {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function TopNavigation({ title, subtitle, right }: TopNavigationProps) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], minHeight: 56, padding: `calc(env(safe-area-inset-top) + ${spacing[3]}) 0 ${spacing[2]}` }}>
      <div>
        <div style={{ fontSize: typography.caption.fontSize, color: colors.muted }}>{subtitle || 'Fieldmate AI'}</div>
        <div style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, lineHeight: typography.title.lineHeight }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: spacing[2] }}>{right}</div>
    </header>
  )
}
