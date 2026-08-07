import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type SearchBarProps = React.InputHTMLAttributes<HTMLInputElement>

export function SearchBar(props: SearchBarProps) {
  return (
    <div style={{ position: 'relative' }}>
      <span aria-hidden="true" style={{ position: 'absolute', left: spacing[4], top: '50%', transform: 'translateY(-50%)', color: colors.muted }}>🔎</span>
      <input
        {...props}
        style={{
          width: '100%',
          minHeight: 48,
          borderRadius: radius.large,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.text,
          padding: `${spacing[3]} ${spacing[4]} ${spacing[3]} ${spacing[7]}`,
          fontSize: typography.body.fontSize,
          outline: 'none',
          boxShadow: '0 8px 24px rgba(17, 24, 39, 0.04)',
          ...props.style,
        }}
      />
    </div>
  )
}
