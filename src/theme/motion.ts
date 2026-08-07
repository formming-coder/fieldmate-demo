import { Variants } from 'framer-motion'

export const motionTokens = {
  fast: { duration: 0.18, ease: 'easeOut' },
  normal: { duration: 0.24, ease: 'easeOut' },
  slow: { duration: 0.32, ease: 'easeOut' },
  springSoft: { type: 'spring', stiffness: 220, damping: 24, mass: 0.86 },
  springSheet: { type: 'spring', stiffness: 250, damping: 28, mass: 0.88 },
} as const

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: motionTokens.springSoft },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: motionTokens.fast },
}

export const staggerList: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: motionTokens.springSoft },
}
