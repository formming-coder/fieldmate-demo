import React from 'react'
import { motion } from 'framer-motion'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { spacing } from '../../theme/spacing'

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

export function IconButton({ label, style, children, ...props }: React.PropsWithChildren<IconButtonProps>) {
  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      style={{
        width: 48,
        height: 48,
        borderRadius: radius.large,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        color: colors.secondary,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(17, 24, 39, 0.06)',
        padding: 0,
        ...style,
      }}
      {...(buttonProps as any)}
    >
      {children}
    </motion.button>
  )
}
