import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type DropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

export function Dropdown({ label, style, ...props }: DropdownProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
      {label ? <span style={{ fontSize: typography.caption.fontSize, fontWeight: 600, color: colors.muted }}>{label}</span> : null}
      <select
        {...props}
        style={{
          minHeight: 48,
          borderRadius: radius.large,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.text,
          padding: `${spacing[3]} ${spacing[4]}`,
          fontSize: typography.body.fontSize,
          outline: 'none',
          ...style,
        }}
      />
    </label>
  )
}
