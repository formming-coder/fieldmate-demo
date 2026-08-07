import React from 'react'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'

export type SegmentControlProps = {
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function SegmentControl({ options, value, onChange }: SegmentControlProps) {
  return (
    <div style={{ display: 'flex', gap: spacing[2], background: colors.background, padding: spacing[1], borderRadius: radius.large }}>
      {options.map((option) => {
        const active = option === value
        return (
          <button key={option} onClick={() => onChange(option)} style={{ flex: 1, minHeight: 40, border: 'none', borderRadius: radius.medium, background: active ? colors.primary : 'transparent', color: active ? colors.secondary : colors.muted, fontWeight: 700 }}>
            {option}
          </button>
        )
      })}
    </div>
  )
}
