import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'primary' | 'success' | 'warning' | 'danger'
}

export function Badge({ tone = 'primary', style, children, ...props }: BadgeProps) {
  const background = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.primary
  const color = tone === 'primary' ? colors.secondary : colors.surface

  return (
    <span
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing[1]} ${spacing[3]}`,
        borderRadius: radius.large,
        background,
        color,
        fontSize: typography.caption.fontSize,
        fontWeight: 700,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
