import React from 'react'
import { motion } from 'framer-motion'

type BrandMarkProps = {
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
}

const sizeMap = {
  small: 64,
  medium: 88,
  large: 124,
} as const

export default function BrandMark({ size = 'medium', animated = false }: BrandMarkProps) {
  const dimension = sizeMap[size]
  const ringInset = Math.max(5, Math.floor(dimension * 0.08))

  const content = (
    <div className="brand-mark" style={{ width: dimension, height: dimension }} aria-hidden="true">
      <div className="brand-mark-ring" style={{ inset: ringInset }} />
      <div className="brand-mark-inner">FM</div>
    </div>
  )

  if (!animated) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  )
}