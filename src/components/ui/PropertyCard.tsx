import React from 'react'
import { Card } from './Card'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type PropertyCardProps = {
  title: string
  subtitle?: string
  image?: string
  badge?: string
  actions?: React.ReactNode
}

export function PropertyCard({ title, subtitle, image, badge, actions }: PropertyCardProps) {
  return (
    <Card elevated style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', minHeight: 140, background: colors.background }}>
        {image ? <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
        {badge ? (
          <div style={{ position: 'absolute', top: spacing[3], left: spacing[3], background: colors.primary, color: colors.secondary, padding: '6px 10px', borderRadius: radius.large, fontSize: typography.caption.fontSize, fontWeight: 700 }}>
            {badge}
          </div>
        ) : null}
      </div>
      <div style={{ padding: spacing[4], display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: spacing[3] }}>
          <div>
            <div style={{ fontSize: typography.subtitle.fontSize, fontWeight: typography.subtitle.fontWeight }}>{title}</div>
            {subtitle ? <div style={{ fontSize: typography.body.fontSize, color: colors.muted, marginTop: 2 }}>{subtitle}</div> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      </div>
    </Card>
  )
}
