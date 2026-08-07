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
    minHeight: 50,
    padding: `${spacing[3]} ${spacing[5]}`,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.lineHeight,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    width: fullWidth ? '100%' : 'auto',
    boxShadow: variant === 'primary' ? '0 10px 24px rgba(255, 212, 0, 0.24)' : '0 8px 18px rgba(16,24,40,0.08)',
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
      whileHover={isDisabled ? {} : { boxShadow: variant === 'primary' ? '0 12px 28px rgba(255, 212, 0, 0.3)' : '0 10px 22px rgba(16,24,40,0.1)' }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
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
