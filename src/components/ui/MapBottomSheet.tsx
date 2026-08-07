import React from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { spacing } from '../../theme/spacing'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

export type MapBottomSheetProps = {
  open: boolean
  title: string
  subtitle?: string
  onClose?: () => void
  children?: React.ReactNode
}

export function MapBottomSheet({ open, title, subtitle, onClose, children }: MapBottomSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        <div>
          <div style={{ fontSize: typography.title.fontSize, fontWeight: typography.title.fontWeight }}>{title}</div>
          {subtitle ? <div style={{ fontSize: typography.body.fontSize, color: colors.muted, marginTop: 4 }}>{subtitle}</div> : null}
        </div>
        {children}
        <Button fullWidth>ดูรายละเอียด</Button>
      </div>
    </BottomSheet>
  )
}
