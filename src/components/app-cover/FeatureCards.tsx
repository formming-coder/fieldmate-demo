import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type FeatureItem = {
  icon: string
  title: string
  description: string
}

type FeatureCardsProps = {
  items: FeatureItem[]
}

export default function FeatureCards({ items }: FeatureCardsProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="app-cover-feature-section" aria-label="Premium feature preview">
      {items.map((item, index) => (
        <motion.article
          key={item.title}
          className="app-cover-feature-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? {} : { y: -2, scale: 1.01 }}
          whileTap={reduceMotion ? {} : { scale: 0.986 }}
          transition={{
            delay: 0.2 + index * 0.09,
            duration: 0.52,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="app-cover-feature-icon" aria-hidden="true">{item.icon}</div>
          <div className="app-cover-feature-copy">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </div>
        </motion.article>
      ))}
    </section>
  )
}
