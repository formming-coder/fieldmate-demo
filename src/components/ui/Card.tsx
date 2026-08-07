import React from 'react'
import { motion } from 'framer-motion'
import { colors } from '../../theme/colors'
import { radius } from '../../theme/radius'
import { shadow } from '../../theme/shadow'
import { spacing } from '../../theme/spacing'

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean
  glass?: boolean
}

export function Card({ elevated = false, glass = false, style, children, ...props }: CardProps) {
  const divProps = props as React.HTMLAttributes<HTMLDivElement>
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      style={{
        background: glass ? 'rgba(255,255,255,0.75)' : colors.surface,
        borderRadius: radius.medium,
        padding: spacing[4],
        boxShadow: elevated ? shadow.elevated : shadow.soft,
        border: `1px solid ${colors.border}`,
        backdropFilter: glass ? 'blur(18px)' : undefined,
        ...style,
      }}
      {...(divProps as any)}
    >
      {children}
    </motion.div>
  )
}
