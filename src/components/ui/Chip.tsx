import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type ChipProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean
}

export function Chip({ active = false, style, children, ...props }: ChipProps) {
  return (
    <div
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing[2]} ${spacing[3]}`,
        borderRadius: radius.large,
        background: active ? colors.primary : colors.background,
        color: active ? colors.secondary : colors.muted,
        fontSize: typography.caption.fontSize,
        fontWeight: 700,
        border: `1px solid ${active ? colors.primary : colors.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
