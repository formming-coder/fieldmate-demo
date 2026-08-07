import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function HeroIllustration() {
  const reduceMotion = useReducedMotion()
  const particles = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: 5 + ((index * 13) % 90),
    top: 14 + ((index * 9) % 72),
    delay: (index % 6) * 0.21,
    duration: 5.2 + (index % 7) * 0.7,
  }))

  const smoothMotion = reduceMotion
    ? { x: 0, y: 0 }
    : {
        x: [0, 3, -2, 0],
        y: [0, -2, 3, 0],
      }

  return (
    <motion.section
      className="app-cover-hero"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.58, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <motion.div
        className="app-cover-hero-gradient"
        animate={smoothMotion}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="app-cover-hero-pattern" />

      <motion.div
        className="app-cover-illustration"
        animate={reduceMotion ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hero-map-base" />
        <div className="hero-map-grid" />
        <div className="hero-road hero-road-a" />
        <div className="hero-road hero-road-b" />
        <div className="hero-road hero-road-c" />
        <div className="hero-road hero-road-d" />

        <div className="hero-land hero-land-a" />
        <div className="hero-land hero-land-b" />
        <div className="hero-land hero-land-c" />

        <div className="hero-residential hero-residential-a" />
        <div className="hero-residential hero-residential-b" />
        <div className="hero-townhome hero-townhome-a" />
        <div className="hero-townhome hero-townhome-b" />
        <div className="hero-condo hero-condo-a" />
        <div className="hero-condo hero-condo-b" />
        <div className="hero-commercial hero-commercial-a" />
        <div className="hero-commercial hero-commercial-b" />

        <div className="hero-ai-line hero-ai-line-a" />
        <div className="hero-ai-line hero-ai-line-b" />
        <div className="hero-ai-line hero-ai-line-c" />

        <span className="hero-pin hero-pin-a" />
        <span className="hero-pin hero-pin-b" />
        <span className="hero-pin hero-pin-c" />
        <span className="hero-pin hero-pin-d" />
      </motion.div>

      <div className="app-cover-particles">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="app-cover-particle"
            style={{ left: `${particle.left}%`, top: `${particle.top}%` }}
            animate={
              reduceMotion
                ? { opacity: 0.52 }
                : { y: [0, -12, 0], opacity: [0.22, 0.86, 0.22], scale: [0.95, 1.12, 0.95] }
            }
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.section>
  )
}
