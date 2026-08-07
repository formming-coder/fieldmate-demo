import React from 'react'
import { motion } from 'framer-motion'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'
import { typography } from '../../theme/typography'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
  loading?: boolean
}

export function Button({ variant = 'primary', fullWidth = false, loading = false, style, children, ...props }: ButtonProps) {
  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>
  const isDisabled = Boolean(buttonProps.disabled || loading)
  const baseStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: radius.large,
    minHeight: 48,
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.lineHeight,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    width: fullWidth ? '100%' : 'auto',
    boxShadow: variant === 'primary' ? '0 10px 24px rgba(255, 212, 0, 0.28)' : '0 8px 20px rgba(17,24,39,0.06)',
    background: variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : 'transparent',
    color: variant === 'primary' ? colors.secondary : variant === 'secondary' ? colors.surface : colors.secondary,
    position: 'relative',
    overflow: 'hidden',
    opacity: isDisabled ? 0.58 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  }

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { boxShadow: variant === 'primary' ? '0 14px 30px rgba(255, 212, 0, 0.32)' : '0 12px 24px rgba(17,24,39,0.1)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{ ...baseStyle, ...style }}
      disabled={isDisabled}
      {...(buttonProps as any)}
    >
      {!isDisabled ? <motion.span className="btn-ripple" initial={{ scale: 0, opacity: 0 }} whileTap={{ scale: 4.6, opacity: 0.18 }} transition={{ duration: 0.38 }} /> : null}
      {loading ? <span className="btn-loading-dot" aria-hidden="true" /> : null}
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
    </motion.button>
  )
}
