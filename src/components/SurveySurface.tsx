import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import './SurveySurface.css'

type SurfaceCardProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass'
}

export function SurfaceCard({ children, className = '', variant = 'default', ...props }: SurfaceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={['surface-card', `surface-card-${variant}`, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="section-header">
      <div>
        <div className="section-title">{title}</div>
        {subtitle ? <div className="section-subtitle">{subtitle}</div> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-pill">
      <div className="stat-pill-value">{value}</div>
      <div className="stat-pill-label">{label}</div>
    </div>
  )
}
