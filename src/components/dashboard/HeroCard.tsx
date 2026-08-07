import React, { memo } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

type HeroCardProps = {
  total: number
  completed: number
  remaining: number
}

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (current) => Math.round(current))

  React.useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.9, ease: 'easeOut' })
    return () => controls.stop()
  }, [motionValue, value])

  return <motion.span>{rounded}</motion.span>
}

function HeroCard({ total, completed, remaining }: HeroCardProps) {
  const ratio = Math.min(1, completed / Math.max(total, 1))
  const circumference = 2 * Math.PI * 44
  const offset = circumference * (1 - ratio)

  return (
    <motion.section
      className="dashboard-card hero-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
    >
      <div>
        <p className="dashboard-eyebrow">วันนี้มีงานทั้งหมด</p>
        <h1 className="hero-total"><AnimatedNumber value={total} /> งาน</h1>
        <div className="hero-stats-row">
          <div>
            <span>Completed</span>
            <strong><AnimatedNumber value={completed} /></strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong><AnimatedNumber value={remaining} /></strong>
          </div>
        </div>
      </div>

      <div className="hero-ring-wrap" aria-label="Progress">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="44" className="hero-ring-track" />
          <motion.circle
            cx="60"
            cy="60"
            r="44"
            className="hero-ring-progress"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="hero-ring-label">{Math.round(ratio * 100)}%</div>
      </div>
    </motion.section>
  )
}

export default memo(HeroCard)