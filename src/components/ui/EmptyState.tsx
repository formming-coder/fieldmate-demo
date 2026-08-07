import React from 'react'
import { Card } from './Card'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'
import { colors } from '../../theme/colors'

export type EmptyStateProps = {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: spacing[3], padding: spacing[6], borderRadius: 24 }}>
      <div style={{ width: 86, height: 86, borderRadius: 24, background: 'linear-gradient(145deg, rgba(255,212,0,0.22), rgba(255,255,255,0.9))', display: 'grid', placeItems: 'center' }}>
        <span className="material-symbols-rounded" style={{ fontSize: 34, color: '#7a5600' }} aria-hidden="true">inventory_2</span>
      </div>
      <div style={{ fontSize: typography.subtitle.fontSize, fontWeight: typography.subtitle.fontWeight }}>{title}</div>
      {description ? <div style={{ fontSize: typography.body.fontSize, color: colors.muted }}>{description}</div> : null}
      {action ? <div>{action}</div> : null}
    </Card>
  )
}
