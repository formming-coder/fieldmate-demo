import React from 'react'
import { motion } from 'framer-motion'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'

export type FloatingActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

export function FloatingActionButton({ label, style, ...props }: FloatingActionButtonProps) {
  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      aria-label={label}
      style={{
        position: 'fixed',
        left: 'calc(50% + 142px)',
        transform: 'translateX(-50%)',
        bottom: 'calc(90px + env(safe-area-inset-bottom))',
        width: 56,
        height: 56,
        borderRadius: radius.extra,
        border: 'none',
        background: colors.primary,
        color: colors.secondary,
        boxShadow: '0 16px 36px rgba(255, 212, 0, 0.32)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 15,
        ...style,
      }}
      {...(buttonProps as any)}
    >
      {label}
    </motion.button>
  )
}
