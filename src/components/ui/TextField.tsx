import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
      {label ? <span style={{ fontSize: typography.caption.fontSize, fontWeight: 600, color: colors.muted }}>{label}</span> : null}
      <input
        {...props}
        style={{
          minHeight: 50,
          borderRadius: radius.large,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.text,
          padding: `${spacing[3]} ${spacing[5]}`,
          fontSize: typography.body.fontSize,
          outline: 'none',
          ...style,
        }}
      />
    </label>
  )
}
