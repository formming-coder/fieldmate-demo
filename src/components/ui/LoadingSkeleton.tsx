import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'

export type LoadingSkeletonProps = {
  rows?: number
}

export function LoadingSkeleton({ rows = 3 }: LoadingSkeletonProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }} className="global-skeleton-stack">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} style={{ background: colors.surface, borderRadius: radius.medium, padding: spacing[4], boxShadow: '0 8px 24px rgba(17,24,39,0.04)' }}>
          <div className="global-skeleton-line" style={{ height: 14, width: '70%', borderRadius: 999, marginBottom: spacing[3] }} />
          <div className="global-skeleton-line" style={{ height: 12, width: '100%', borderRadius: 999, marginBottom: spacing[2] }} />
          <div className="global-skeleton-line" style={{ height: 12, width: '60%', borderRadius: 999 }} />
        </div>
      ))}
    </div>
  )
}
