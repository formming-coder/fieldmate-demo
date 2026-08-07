import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import EntryShell from '../components/EntryShell'
import { Button } from '../components/ui'

export const ONBOARDING_STORAGE_KEY = 'fieldmate-onboarding-complete'

const slides = [
  {
    title: 'Explore property context instantly',
    description: 'Overlay smart map layers, GIS insight, and shared field evidence in one mobile workflow.',
    icon: '🗺',
  },
  {
    title: 'Capture evidence with AI assistance',
    description: 'Use AI Camera for OCR, metadata, quality scoring, and structured inspection capture.',
    icon: '📷',
  },
  {
    title: 'Turn every visit into shared intelligence',
    description: 'Sync property knowledge, route plans, assessments, and team-ready field summaries.',
    icon: '🧠',
  },
] as const

function completeOnboarding() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const isLast = index === slides.length - 1

  const progress = useMemo(() => `${index + 1}/${slides.length}`, [index])

  const goNext = () => {
    if (isLast) {
      completeOnboarding()
      navigate('/welcome')
      return
    }
    setIndex((current) => current + 1)
  }

  const skip = () => {
    completeOnboarding()
    navigate('/welcome')
  }

  return (
    <EntryShell>
      <div className="onboarding-screen">
        <div className="onboarding-topline">
          <div className="onboarding-progress-label">Onboarding {progress}</div>
          <button type="button" className="onboarding-skip" onClick={skip}>Skip</button>
        </div>

        <motion.section
          key={slide.title}
          className="onboarding-stage"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <div className="onboarding-visual">
            <div className="onboarding-visual-orb onboarding-visual-orb-a" />
            <div className="onboarding-visual-orb onboarding-visual-orb-b" />
            <div className="onboarding-phone-mock">
              <div className="onboarding-phone-notch" />
              <div className="onboarding-phone-map" />
              <div className="onboarding-phone-card onboarding-phone-card-top">{slide.icon}</div>
              <div className="onboarding-phone-card onboarding-phone-card-bottom" />
            </div>
          </div>

          <div className="onboarding-copy">
            <div className="onboarding-kicker">Fieldmate AI</div>
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
          </div>
        </motion.section>

        <div className="onboarding-dots" aria-label="Onboarding progress">
          {slides.map((item, dotIndex) => (
            <span key={item.title} className={dotIndex === index ? 'is-active' : ''} />
          ))}
        </div>

        <div className="onboarding-actions">
          <Button fullWidth variant="secondary" onClick={skip}>Skip</Button>
          <Button fullWidth onClick={goNext}>{isLast ? 'Get Started' : 'Next'}</Button>
        </div>
      </div>
    </EntryShell>
  )
}
