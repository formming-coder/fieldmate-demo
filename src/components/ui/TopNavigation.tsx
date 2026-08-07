import React from 'react'
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
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], minHeight: 60, padding: `calc(env(safe-area-inset-top) + ${spacing[2]}) 0 ${spacing[2]}` }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: typography.caption.fontSize, color: colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle || 'ฟีลด์เมต AI'}</div>
        <div style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight, lineHeight: typography.title.lineHeight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: spacing[2], flexShrink: 0 }}>{right}</div>
    </header>
  )
}
